/*
 * tokenHandler
 *
 * Cord Phelps
 * Copyright 2014, 
*
*/

package app
// http://stackoverflow.com/questions/14086063/serve-homepage-and-static-content-from-root

// TODO: new cron: every 15 minutes get a new "-----" list for memcache

import (

    //"os"
    //"fmt"
    //"time"
    
    "encoding/json"
    "net/http"
    "net/url"

    //"bytes"
    "strings"
    "io/ioutil"

    "appengine"
    "appengine/urlfetch"
    //"appengine/datastore"


)



const (
    MIN_LENGTH = 20 //characters
    MAX_LENGTH = 1500  //characters 

    TOKEN_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="
    DATA_URL = "http://irrigavidata.appspot.com/tokeninfo?"
    OAUTH2_CLIENT_ID = "701838661355-eb855c0l9vu3mh24fq0kih5f60euqap3.apps.googleusercontent.com" 
)

var OK_RESPONSE GetReply
var OK_JSON []byte


type GetReply struct {
  ResponseText      string      `json:"response_text,omitempty"`
  Status            string      `json:"status,omitempty"`
}

type TokenStatus struct {
    IssuedTo        string       `json:"issued_to,omitempty"`
    Audience        string       `json:"audience,omitempty"`
    User_id         string       `json:"user_id,omitempty"`
    Scope           string       `json:"scope,omitempty"`
    Expires_in      int64        `json:"expires_in,omitempty"`
    Email           string       `json:"email,omitempty"`
    VerifiedEmail   bool         `json:"verified_email,omitempty"`
    AccessType      string       `json:"access_type,omitempty"`
}



type DataStatus struct {
    AccessType      string       `json:"access_type,omitempty"`
    Success         bool         `json:"success,omitempty"`
    Data            string       `json:"data,omitempty"`
}



func handleData(c appengine.Context, w http.ResponseWriter, r *http.Request, token string, command string, jsString string) {

    //
    // send the token and the content to the dataServer
    //

    // some content
    var contentObj DataStatus
    //contentObj.AccessType = "download"
    contentObj.Success = true
    //contentObj.Data = jsString


    // https://cloud.google.com/appengine/docs/go/urlfetch/
    nc := appengine.NewContext(r)
    client := urlfetch.Client(nc)
    resp, err := client.Get(DATA_URL + "token=" + token + "&" + command + "=" + jsString)
    if err != nil {
        c.Warningf("http.StatusInternalServerError %v", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    // http://stackoverflow.com/questions/17156371/how-to-get-json-response-in-golang
    defer resp.Body.Close()

    c.Infof("handleData() sent to dataServer: HTTP GET returned status code %v , status: %v", resp.StatusCode, resp.Status)

    if resp.StatusCode == 400 || resp.StatusCode == 406 || resp.StatusCode == 500 {

        // 'data not saved'
        c.Infof("handleData(): data not saved, urlFetch StatusCode from dataServer: %v", resp.StatusCode)
        w.Write(OK_JSON)
        return

    }

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        c.Warningf("handleData(): ioutil.ReadAll error %v", err)
        w.Write(OK_JSON)
        return
    }

    c.Infof("handleData(): response from dataServer: %+v", string(body))

    if resp.StatusCode == 200 {

        //
        //  pass the dataServer response back to the client (with code 200)
        //
        w.Header().Set("Content-Type", "application/json")
        w.Write(body)

    } else {

        err = json.Unmarshal( body, &contentObj)
        if err != nil {
            c.Warningf("handleData(): json.Unmarshal error %v", err)
            w.Write(OK_JSON)
            return
        }

    }


    return


}




func get(c appengine.Context, w http.ResponseWriter, r *http.Request) {

    token := r.FormValue("token")
    //save := r.FormValue("save")
    //download := r.FormValue("download")
    op := r.FormValue("op")

    //c.Infof("get(), token: %s  \nsave: %s \ndownload %s", token, save, download)
    c.Infof("get(), token: %s  command: %s ", token, op)


    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "application/json")

    //
    // verify that the token is current
    //

    // https://cloud.google.com/appengine/docs/go/urlfetch/
    nc := appengine.NewContext(r)
    client := urlfetch.Client(nc)
    resp, err := client.Get(TOKEN_URL + token)
    if err != nil {
        c.Warningf("http.StatusInternalServerError %v", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    // http://stackoverflow.com/questions/17156371/how-to-get-json-response-in-golang
    defer resp.Body.Close()

    // fmt.Fprintf(w, "HTTP GET returned status %v", resp.Status)
    c.Infof("get() checking token: HTTP GET string %v", TOKEN_URL + token)
    c.Infof("get() checking token: HTTP GET returned status code %v , status: %v", resp.StatusCode, resp.Status)

    if resp.StatusCode == 400 {

        // that was probably an expired token
        // resp.Status = '400 Bad Request'
        c.Infof("expired token: StatusCode: %v", resp.StatusCode)
        w.Write(OK_JSON)
        return

    }

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        c.Warningf("ioutil.ReadAll error %v", err)
        return
    }

    //c.Infof("ioutil.ReadAll, body: %+v", string(body))

    var data TokenStatus
    err = json.Unmarshal( body, &data)
    if err != nil {
        c.Warningf("json.Unmarshal error %v", err)
        return
    }

    //
    // verify that the clientID is a match
    //

    // c.Infof("json.Unmarshal data, audience: %+v", data.Audience)
    if data.Audience == OAUTH2_CLIENT_ID {

        c.Infof("clientID does match")

        // send a request to the dataServer

        // http://stackoverflow.com/questions/17450062/golang-cannot-assign-byte-to-z-type-string-in-multiple-assignment
        // jsString := string(js)

        //var command string
        //var jsString string
        //if len(save) > 0 { 
            //command = "save" 
            //jsString = save
        //} else if len(download) > 0 { 
            //command = "download"
            //jsString = download
        //}
        // c.Infof("sent command: %v content: %v", command, jsString)

        command := "op"
        content := op

        c.Infof("get() sending command: %v content: %v", command, content)

        handleData(c, w, r, token, command, content)

        return

        // connection stays open with keepalive functionality; closed eventually by the handler....
        // https://groups.google.com/forum/#!topic/golang-nuts/vdNhwoqZE_c

        } else {

            //
            // return 'OK' (even though its an error)
            //
            c.Warningf("clientID does not match")
            w.Write(OK_JSON)
            return

        }




}

func handle(w http.ResponseWriter, r *http.Request) {

    // standard wildcard GET /?field1=-----&field4=aaaaa%2Cbbbbb%2Cccccc%2Cddddd%2Ceeeee%2Cfffff%2Cggggg%2Chhhhh&_=1414506683295
    token := r.FormValue("token")
    // op := r.FormValue("op")     <--- not used here

    c := appengine.NewContext(r)
    c.Infof("token: %v ", token)
    c.Infof("r.URL.String() 1: %s  \n", r.URL.String() )

    ip := strings.Split(r.RemoteAddr,":")[0]
    c.Infof("inbound request from ip: %v", ip)

    OK_RESPONSE = GetReply{"OK", "200"}
    OK_JSON, err := json.Marshal(OK_RESPONSE)
    if err != nil {
        c.Warningf("handle() json.Marshal() err: %v", err.Error)
        w.Write(OK_JSON)
        return
    }

    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "application/json")

    poster := frequentPoster(c, r, ip)

    if poster == true {
        //
        // return 'OK' (even though its an error)
        //
        c.Warningf("handle() bailing on frequentPoster() result")
        w.Write(OK_JSON)
        return

    }

    // http://stackoverflow.com/questions/23941032/net-url-package-strip-query-from-url/23941104#23941104
    // https://gobyexample.com/url-parsing
    u, err := url.Parse( r.URL.String() )
    if err != nil {
        c.Warningf("handle() url.Parse() err: %v", err.Error)
        w.Write(OK_JSON)
        return
    }
    c.Infof("u.Path: %s  \n", u.Path )

    // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing (see simplified example)
    w.Header().Add("Access-Control-Allow-Origin", "*")
    w.Header().Add(
        "Access-Control-Allow-Methods",
        // "OPTIONS, HEAD, GET, POST, PUT, DELETE",
        "HEAD, GET, POST",
        // The methods GET and HEAD MUST be supported by all general-purpose servers.
        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
        // The HEAD method is identical to GET except that the server MUST NOT return a message-body in the response. 
        // The metainformation contained in the HTTP headers in response to a HEAD request SHOULD be identical to the 
        //  information sent in response to a GET request.
    )
    w.Header().Add(
        "Access-Control-Allow-Headers",
        "Content-Type, Content-Range, Content-Disposition",
    )
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "application/json")


    switch r.Method {

    case "OPTIONS":
        //http.Error(w, "501 pas mis en œuvre", http.StatusNotImplemented)
        c.Warningf("handle() UNEXPECTED OPTIONS request for ip: %v", ip)
        w.Write(OK_JSON)
        return

    case "HEAD":

        c.Warningf("handle() UNEXPECTED HEAD request for ip: %v", ip)
        w.Write(OK_JSON)
        return

    case "GET":

        if len(token) <= MIN_LENGTH || len(token) >= MAX_LENGTH {

            c.Warningf("handle() strange token length (%v) for ip: %v", len(token), ip)
            w.Write(OK_JSON)
            return

        } else {

            c.Infof("heading to get(), r.URL.RequestURI(): %s  \n", r.URL.RequestURI() )
            get(c, w, r)
            return

        }


    case "POST":

        c.Warningf("handle() UNEXPECTED POST request for ip: %v", ip)
        w.Write(OK_JSON)
        return


    default:

        c.Warningf("handle() UNKNOWN request for ip: %v", ip)
        w.Write(OK_JSON)
        return

    }


}



func init() {

    http.HandleFunc("/tokeninfo", handle)


}


