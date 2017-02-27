/*
 * dataHandler
 *
 * Cord Phelps
 * Copyright 2014, MIT License
 * http://www.opensource.org/licenses/MIT
*
*/

package app

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
    "appengine/datastore"


)


const (
    MIN_LENGTH = 20 //characters
    MAX_CONTENT_LENGTH = 512  //characters 
    MAX_CONTENT_SIZE = 327 // bytes
    MAX_RECORDS = 365

    TOKEN_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="
    OAUTH2_CLIENT_ID = "701838661355-eb855c0l9vu3mh24fq0kih5f60euqap3.apps.googleusercontent.com" 
    PRIVILEGED_USER = "113053814757170526890"

)

var dataTable = "data"

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

type DataRecord struct {
    User_id         string     `datastore:"user_id"`
    Network         string     `datastore:"network"`
    Domain          string     `datastore:"domain"` 
    Instrument      string     `datastore:"instrument"`
    ContentString   string     `datastore:"contentstring,omitempty"`    
    // timestamp to be buried in the content 
}

var queryGetResults []DataRecord
var outboundRecord DataRecord

type ContentStruct struct {
    // 'the size of an array in go is intrinsic to its type' the go programming phrasebook, pg 63
    ByteArray         [MAX_RECORDS][]byte     
}


func handleDataRequest(c appengine.Context, w http.ResponseWriter, user_id string, network string, content string)  {

    // this is 

   c.Infof("handleData() : inbound json string: %s", content) 

   var op string
   var domain string
   var instrument string

// the content JSON    
//{
    // "op": "save" || "delete" ,
    // "user": "joe",
    // "domain": "vino",
    // "inst": "inst",
    // "time": "time",
    // "probes": {
    //    "probe": {
    //        "val": "2",
    //        "v": "2"
    //    },
    //    "probe2": {
    //        "val": "2",
    //        "v": "2"
    //    }
    //}
//}
    OK_RESPONSE := GetReply{"OK", "200"}
    OK_JSON, err := json.Marshal(OK_RESPONSE)
    if err != nil {
        c.Warningf("handleDataRequest() json.Marshal() err: %v", err.Error)
        return
    }

    // pull the command, the domain and instrument out of content

    // convert the string to bytes[]
    // http://stackoverflow.com/questions/8032170/how-to-assign-string-to-bytes-array
    contentBytes := []byte(content)
    // decode arbitrary data
    // http://blog.golang.org/json-and-go
    // Without knowing this data's structure, we can decode it into an interface{} value with Unmarshal:
    var f interface{}
    err = json.Unmarshal(contentBytes, &f)
    // At this point the Go value in f would be a map whose keys are strings and whose values are 
    // themselves stored as empty interface values:
    // To access this data we can use a type assertion to access `f`'s underlying map[string]interface{}:
    m := f.(map[string]interface{})
    // We can then iterate through the map with a range statement and use a type switch to access its 
    // values as their concrete types:
    for k, v := range m {
    switch vv := v.(type) {
    case string:
        c.Infof("handleData() : %s is string: %s", k, vv)
        if k == "op" { op = vv }
        if k == "domain" { domain = vv }
        if k == "instrument" { instrument = vv }
    case int:
        c.Infof("handleData() int:  %v is int  %v", k, vv)
    case []interface{}:
        c.Infof(k, " is an array:")
        for i, u := range vv {
            c.Infof("handleData() array %v %v", i, u)
        }
    default:
        c.Infof(k, "handleData() unknown type")
    }
}

    // type = 'DataRecord'
    outboundRecord.User_id = user_id
    outboundRecord.Network = network
    outboundRecord.Domain = domain
    outboundRecord.Instrument = instrument
    outboundRecord.ContentString = content

    // TODO: some content checking of domain / instrument

    c.Infof("handleData() : checking op: %s", op)

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    if op == "save" {

        kk := datastore.NewIncompleteKey(c, dataTable, nil)
        _, err = datastore.Put(c, kk, &outboundRecord)
        if err != nil {
            c.Errorf("handleData(): save: error writing to datastore: %v", err)

            w.Write(OK_JSON)
            return
        }

        c.Infof("handleData(): save: wrote new content OK_JSON: %v", string(OK_JSON))

        // that was op = 'save' or delete'
        c.Infof("handleDataRequest() action: %v ", op)

        w.Write(OK_JSON)




    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    } else if op == "delete" && user_id == PRIVILEGED_USER {

        var queryResults []DataRecord

        c.Infof("handleData():  'delete'")
        keys, err := datastore.NewQuery(dataTable).Filter("user_id =", user_id).GetAll(c, &queryResults)
        if err != nil {
            c.Errorf("handleData(): 'delete' error attempting to get user_id records: %v", err)
            w.Write(OK_JSON)
            return
        }
        count := len(queryResults) 
        c.Infof("handleData():  'delete' : found %d records for user %s", count, user_id)
        for i, _ := range queryResults {
            err = datastore.Delete(c, keys[i])
            if err != nil {
                c.Errorf("handleData(): 'delete', error %v deleting datastore item", err)
                w.Write(OK_JSON)
                return
            }
            c.Infof("handleData(): 'delete', deleted datastore item")
        }

        // that was op = 'save' or delete'
        c.Infof("handleDataRequest() action: %v ", op)
        w.Write(OK_JSON)
        return

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    } else if op == "delete" && user_id != PRIVILEGED_USER {

        c.Warningf("handleData(): non-privileged user (%v) attempting to delete records", user_id)

        // that was op = 'save' or delete'
        c.Infof("handleDataRequest() action: %v ", op)
        w.Write(OK_JSON)
        return

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    } else if op == "report" {

        // maximum length of HTTP GET request?
        // http://stackoverflow.com/questions/2659952/maximum-length-of-http-get-request?rq=1

        //c.Infof("handleData(): attempting to generate report: %v", content)

        var queryResults []DataRecord

        datastore.NewQuery(dataTable).Filter("user_id =", user_id).GetAll(c, &queryResults)
        count := len(queryResults) 
        c.Infof("NOW handleData: report, count: %v", count) 

        // get the length of the results
        bufLen := 0
        // http://blog.golang.org/slices
        // avoid resetting the tempBytes
        tempBytes := make([]byte, MAX_CONTENT_SIZE)
        var items ContentStruct

        for i := 0; i < count; i++ {
            // 
            tempBytes, _ = json.Marshal(queryResults[i])
            //c.Infof("bytes: %v \nqueryResults: %v", string( tempBytes ), queryResults[i]  )
            //bufLen = bufLen + len(tempBytes)  

            var tempStruct DataRecord
            err := json.Unmarshal(tempBytes, &tempStruct)  // this is *all* fields and labels
            if err != nil {
                c.Warningf("handleData: json.Unmarshal, err: %v", err) 
            return
            }
            
            b := []byte(tempStruct.ContentString)           // convert string to byte
            requiredLen := len(tempStruct.ContentString)   // just contents indexed "ContentString"
            yet := make([]byte, requiredLen, requiredLen)  
            for j := range b {
                yet[j] = b[j]
            }
            items.ByteArray[i] = yet
            bufLen = bufLen + len(items.ByteArray[i]) 

        }

        // w.Header().Set("Content-Type", "text/plain")  <--- cannot be changed dynamically
        // Changing the header after a call to WriteHeader (or Write) has no effect.
        // http://golang.org/pkg/net/http/#ResponseWriter
        //
        // WriteHeader sends an HTTP response header with status code.
        // If WriteHeader is not called explicitly, the first call to Write
        // will trigger an implicit WriteHeader(http.StatusOK).
        // Thus explicit calls to WriteHeader are mainly used to
        // send error codes.
        // http://golang.org/pkg/net/http/
        // w.WriteHeader(205)  <--- was being used to branch inside the clients ajax success handler 
        // code other tha 2xx trigger the error handler

        for l:=0; l < count; l++ {

            c.Infof("checking items.ByteArray[]: %v", string( items.ByteArray[l] ))

            if len(items.ByteArray[l]) <= MAX_CONTENT_LENGTH {
                w.Write(items.ByteArray[l])
                w.Write([]byte("|"))   // record separator
            } else {
                // too many bytes to send
            }
        }

        return

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////


    } else {
        //
        // unknown action
        c.Warningf("handleDataRequest() unknown action: %v ", op)
        w.Write(OK_JSON)

        return

    }

}


func get(c appengine.Context, w http.ResponseWriter, r *http.Request) {

    token := r.FormValue("token")
    op := r.FormValue("op")
    c.Infof("get(), token: %s  op: %s ", token, op)

    w.Header().Set("Cache-Control", "no-cache")

    OK_RESPONSE := GetReply{"OK", "200"}
    OK_JSON, err := json.Marshal(OK_RESPONSE)
    if err != nil {
        c.Warningf("handleDataRequest() json.Marshal() err: %v", err.Error)
        return
    }

    //
    // verify that the token is current
    //

    // https://cloud.google.com/appengine/docs/go/urlfetch/
    nc := appengine.NewContext(r)
    client := urlfetch.Client(nc)
    resp, err := client.Get(TOKEN_URL + token)
    if err != nil {
        c.Warningf("token not validated, err.Error(): %v  err: %v", err.Error(), err)
        http.Error(w, "StatusInternalServerError", 500)
        return
    }
    // http://stackoverflow.com/questions/17156371/how-to-get-json-response-in-golang
    defer resp.Body.Close()

    c.Infof("HTTP GET string %v", TOKEN_URL + token)
    c.Infof("handleData(): HTTP GET returned status code %v , status: %v", resp.StatusCode, resp.Status)

    if resp.StatusCode == 400 {

        // that was probably an expired token
        // resp.Status = '400 Bad Request'
        c.Warningf("expired token: StatusCode: %v", resp.StatusCode)
        // returning an error 406 to the authServer to indicate 'data not saved'
        http.Error(w, "StatusNotAcceptable", 406)
        return

    }

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        c.Warningf("ioutil.ReadAll error %v", err)
        // returning an error 400 to the authServer to indicated 'data not saved'
        http.Error(w, "StatusBadRequest", 400)
        return
    }

    //c.Infof("ioutil.ReadAll, body: %+v", string(body))

    var data TokenStatus
    err = json.Unmarshal( body, &data)
    if err != nil {
        c.Warningf("json.Unmarshal error %v", err)
        // returning an error 400 to the authServer to indicated 'data not saved'
        http.Error(w, "StatusBadRequest", 400)
        return
    }

    //
    // verify that the clientID is a match
    //

    // c.Infof("json.Unmarshal data, audience: %+v", data.Audience)
    if data.Audience == OAUTH2_CLIENT_ID {

        c.Infof("clientID does match")

        if len(data.User_id) > 5 && len(data.Email) > 7 && len(op) > 0 {

            handleDataRequest(c, w, data.User_id, "google", op);

            return

        } else {      // user_id and/or email looks bogus  (don't log email)
        
            c.Warningf("get(): user_id and/or email and/or op looks bogus id: %v  op: %v", data.User_id, op)

            w.Write(OK_JSON)
            return 
        }


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
    op := r.FormValue("op")

    c := appengine.NewContext(r)
    ip := strings.Split(r.RemoteAddr,":")[0]
    c.Infof("handle() inbound request from ip: %v  r.URL.String(): %s", ip, r.URL.String())
    c.Infof("handle(), token: %s  op %s", token, op)

    OK_RESPONSE := GetReply{"OK", "200"}
    OK_JSON, err := json.Marshal(OK_RESPONSE)
    if err != nil {
        c.Warningf("handle() json.Marshal() err: %v", err.Error)
        return
    }

    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Content-Type", "application/json")

    if frequentPoster(c, r, ip) {
        //
        // return 'OK' (even though its an error)
        //
        w.Write(OK_JSON)
        return

    }

    u, err := url.Parse( r.URL.String() )
    if err != nil {
        c.Warningf("handle() url.Parse() err: %v", err.Error)
        w.Write(OK_JSON)
        return
    }
    c.Infof("handle() u.Path: %s  \n", u.Path )

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

        if len(op) >= MAX_CONTENT_LENGTH || len(op) >= MAX_CONTENT_LENGTH {

            c.Warningf("handle() strange op length for ip: %v", ip)
            w.Write(OK_JSON)
            return

        } else {

            c.Infof("heading to get(), r.URL.RequestURI(): %s  \n", r.URL.RequestURI() )
            get(c, w, r)
            return

        }


    case "POST":

        w.Write(OK_JSON)
        return


    default:

        w.Write(OK_JSON)
        return

    }


}



func init() {

    http.HandleFunc("/tokeninfo", handle)


}


