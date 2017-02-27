/*
 * irrigavi server v0
 *
 * Cord Phelps
 * Copyright 2015, MIT License
 * http://www.opensource.org/licenses/MIT
*
*/

package app

import (

    "os"
    "fmt"

    "net/http"
    "net/url"
    "strings"

    "appengine"

)


const (
  
    CACHE_EXPIRATION   = 30 // seconds

)


type justFilesFilesystem struct {
    fs http.FileSystem
}

func (fs justFilesFilesystem) Open(name string) (http.File, error) {
    // http://stackoverflow.com/questions/13302020/rendering-css-in-a-go-web-application
    f, err := fs.fs.Open(name)
    if err != nil {
        return nil, err
    }
    return neuteredReaddirFile{f}, nil
}

type neuteredReaddirFile struct {
    http.File
}

func (f neuteredReaddirFile) Readdir(count int) ([]os.FileInfo, error) {
    return nil, nil
}

func maxAgeHandler(seconds int, h http.Handler) http.Handler {
        // https://groups.google.com/forum/#!topic/golang-nuts/n-GjwsDlRco
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                w.Header().Add("Cache-Control", fmt.Sprintf("max-age=%d, public, must-revalidate, proxy-revalidate", seconds))
                h.ServeHTTP(w, r)
        })
}







func handle(w http.ResponseWriter, r *http.Request) {

    c := appengine.NewContext(r)
    c.Infof("r.URL.String() 1: %s  \n", r.URL.String() )

    ip := strings.Split(r.RemoteAddr,":")[0]
    c.Infof("inbound request from ip: %v", ip)

    // http://stackoverflow.com/questions/23941032/net-url-package-strip-query-from-url/23941104#23941104
    // https://gobyexample.com/url-parsing
    u, err := url.Parse( r.URL.String() )
    if err != nil {
        panic(err)
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


    switch r.Method {

    case "OPTIONS":
        //http.Error(w, "501 pas mis en œuvre", http.StatusNotImplemented)
        //c.Warningf("handle() UNEXPECTED OPTIONS request for ip: %v", ip)
        return

    case "HEAD":

        http.Error(w, "501 pas mis en œuvre", http.StatusNotImplemented)
        c.Warningf("handle() UNEXPECTED HEAD request for ip: %v", ip)
        return

    case "GET":

        if r.URL.String() == "https://irrigavi0490.appspot.com/"  {

            // requesting the naked pasfrais.cc gets r.URL.String() 1: http://pasfrais.cc/
            // and u.Path: /
            
            c.Infof("r.URL.String() 2: %s  \n", r.URL.String() )

            http.ServeFile(w, r, "./index.html")
            // 

        }

    case "POST":

        c.Infof("post: (nothing there)")


    default:

        http.Error(w, "501 pas mis en œuvre", http.StatusNotImplemented)
        c.Warningf("handle() UNEXPECTED default request (probably a PUT) for ip: %v", ip)
    }


}

func serveSingle(pattern string, filename string) {
    // http://stackoverflow.com/questions/14086063/serve-homepage-and-static-content-from-root

    http.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, filename) 
    })
    
}



func init() {


    // serve files in /css/ and /js/ by specific name (no dir listing) and with short cache-timeout
    cssfs := justFilesFilesystem{http.Dir("assets/css/")}
    http.Handle("/assets/css/", maxAgeHandler(CACHE_EXPIRATION, http.StripPrefix("/assets/css/", http.FileServer(cssfs))))

    css3fs := justFilesFilesystem{http.Dir("assets/css3/")}
    http.Handle("/assets/css3/", maxAgeHandler(CACHE_EXPIRATION, http.StripPrefix("/assets/css3/", http.FileServer(css3fs))))

    jsfs := justFilesFilesystem{http.Dir("assets/js/")}
    http.Handle("/assets/js/", maxAgeHandler(CACHE_EXPIRATION, http.StripPrefix("/assets/js/", http.FileServer(jsfs))))

    imagesfs := justFilesFilesystem{http.Dir("images/")}
    http.Handle("/images/", maxAgeHandler(CACHE_EXPIRATION, http.StripPrefix("/images/", http.FileServer(imagesfs))))


    // Mandatory root-based resources
    serveSingle("/sitemap.xml", "./sitemap.xml")
    serveSingle("/favicon.ico", "./favicon.ico")
    serveSingle("/robots.txt", "./robots.txt")

    serveSingle("/index.htm", "./index.html")
    serveSingle("/index.html", "./index.html")

    serveSingle("/splash.png", "./splash.png")

    http.HandleFunc("/", handle)

}


