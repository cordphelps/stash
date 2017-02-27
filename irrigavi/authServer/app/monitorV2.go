
package app

import (

	"fmt"
	"net/http"

    "appengine"
    "appengine/datastore"
    "appengine/memcache"

)

const (
    TOLERATED_HOURLY_GETS = 30     
)

type IpFrequent struct {
    Ip          string     `datastore:"ip"`
    GetCount    int        `datastore:"getCount"`
    Comment     string     `datastore:"comment"`
    Blacklist   bool       `datastore:"blacklist"`
}


var excessive = false
var table = "excessiveIP"
var TOLERATED_LIMIT int


func checkAppEngineQuota(err error) {

    // enhancement
    // https://developers.google.com/appengine/docs/go/reference#Context
    overQuota := appengine.IsOverQuota(err) 

    if overQuota {
        panic(err)
    }

    // timeout := appengine.IsTimeoutError(err)

    // 
    if err != nil {
        panic(err)
    }

}



func frequentPoster(c appengine.Context, r *http.Request, ip string) (valid bool) {

    // check to see if there have been numerous recent posts by this ip address

    var inbound IpFrequent

    // http://stackoverflow.com/questions/13264555/store-an-object-in-memcache-of-gae-in-go/13264958#13264958

    item := &memcache.Item {
        Key: ip,
        Object: &inbound,
    }
    // http://stackoverflow.com/questions/1418324/memcache-maximum-key-expiration-time
    // Expiration: time.Duration(MEMCACHE_IP_EXPIRATION)*time.Second,


    c.Infof("frequentPoster")
        //log.Print("item not in the cache: 

    switch r.Method {

        case "GET":
            TOLERATED_LIMIT = TOLERATED_HOURLY_GETS    
        default:
        	TOLERATED_LIMIT = TOLERATED_HOURLY_GETS          
    }


    // Get the item from the memcache

    // https://developers.google.com/appengine/docs/go/memcache/
    if _, err := memcache.JSON.Get(c, ip, &inbound) ; err == memcache.ErrCacheMiss {

        c.Infof("frequentPoster: ip not in the cache", ip)
        // memcache is cleared by cron hourly

        // refer to the datastore 
        bl := checkBlacklist(c, ip)
        if bl == true {
            c.Warningf("frequentPoster: blacklisted ip noted in datastore %q", ip)
            return true
        }

        // create a memcache Item

        inbound.Ip = ip
        inbound.GetCount = 0 
        inbound.Blacklist = bl

        // Add the item to the memcache, if the key does not already exist
        if err := memcache.JSON.Set(c, item); err == memcache.ErrNotStored {
                    c.Infof("frequentPoster: item with key %q already exists", ip)
                    return true
        } else if err != nil {
                    c.Errorf("frequentPoster: error adding memcache item: %v", err)
                    return true
        }


    } else if err != nil {
        c.Errorf("frequentPoster: UNEXPECTED error getting memcache item: %v", err)
        return true  // perhaps not the fault of the user, but to be safe

    } else {   // item is in memcache

        c.Infof(fmt.Sprintf("frequentPoster: memcache key: %s  found", ip))

        // check if the ip is blacklisted
        if inbound.Blacklist == true {
            c.Warningf("frequentPoster: blacklisted ip noted in memcache %q", ip)
            return true
        }

        if inbound.GetCount > TOLERATED_LIMIT {

            c.Warningf("frequentPoster: count: %v, over the TOLERATED_LIMIT of: ", inbound.GetCount, TOLERATED_LIMIT)

            // increment datastore record
            registerExcessiveIP(c, ip)

            return true

        } else {  // still under the TOLERATED_LIMITS

            c.Infof("frequentPoster: memcache count: %v, still under the TOLERATED_LIMIT of: ", inbound.GetCount, TOLERATED_LIMIT)

            // update the memcache record
            inbound.GetCount = inbound.GetCount + 1
            // Set the item, unconditionally (item points to inbound)
            if err := memcache.JSON.Set(c, item); err != nil {
                c.Errorf("frequentPoster: error setting memcache item: %v", err)
                return true
            }

            c.Infof("frequentPoster: updated memcache")

        }   // end still under the TOLERATED_LIMITS

    }   // end // item is in memcache

    c.Infof("frequentPoster: returning false")
    return false   // carry on
  

}


func checkBlacklist (c appengine.Context, ip string) (valid bool) {

    // check if the ip is blacklisted in the datastore

    var queryResults []IpFrequent

    keys, err := datastore.NewQuery(table).Filter("ip =", ip).Limit(10).GetAll(c, &queryResults)
    if err != nil {
        c.Warningf("checkBlacklist(): error attempting to get ip based records: %v", err)
        return false
    }

    count := len(queryResults)

    c.Infof("checkBlacklist: count: ", count)

    // just as a sanity check, if the record exists, it should be unique
    if count == 0 {   // 
        c.Infof("checkBlacklist(): cool: nothing in datastore")
        return false
    }

    if count == 1 {  // 
        var temp IpFrequent
        // get the record
        err := datastore.Get(c, keys[0], &temp)
        if err != nil {
            c.Warningf("checkBlacklist(): error reading from datastore")
            return false
        }

        if temp.Blacklist == true {
            c.Warningf("checkBlacklist(): ip is blacklisted")
            return true
        } else {
            return false
        }
   
    }  // end count=1

    if count > 1 {  // this should not happen
        c.Warningf("checkBlacklist(): UNEXPECTED ERROR: multiple frequent poster records for ip= ", ip)
        return true;
    }

    // never get here
    return true

}


func registerExcessiveIP (c appengine.Context, ip string) {

    // this ip has made EXCESSIVE requests in the last hour
    // so record this in the datastore

    // if there is no record of this behavior for this ip, create a record
    // if there is a record, increment the counter of this excessive behavior
    // the blacklist flag is intended to be used manually from the console

    // TODO
    // - create a means to blacklist a sub-net
    var queryResults []IpFrequent
    var outbound IpFrequent

    keys, err := datastore.NewQuery(table).Filter("ip =", ip).Limit(10).GetAll(c, &queryResults)
    if err != nil {
        c.Warningf("saveToDatastore: error attempting to get ip based records: %v", err)
        return 
    }

    count := len(queryResults)

    if count == 0 {   // create a new record

        outbound.GetCount = 1
        outbound.Ip = ip
        outbound.Blacklist = false
        outbound.Comment = "--------------------------"

        k := datastore.NewIncompleteKey(c, table, nil)
        _, err := datastore.Put(c, k, &outbound)
        if err != nil {
            c.Errorf("saveToDatastore: error writing to datastore")
            return 
        }

        c.Infof("saveToDatastore: wrote new frequentPoster record for ip= ", ip)

        return 
    }

    if count == 1 {  // then this record should be updated

        var temp IpFrequent

        // get the record
        err := datastore.Get(c, keys[0], &temp)
        if err != nil {
            c.Errorf("saveToDatastore: error reading from datastore")
            return 
        }

        c.Infof("saveToDatastore: > TOLERATED_LIMIT, datastore count=1, : inbound.GetCount= %v", temp.GetCount)

        outbound.GetCount = temp.GetCount + 1    
        outbound.Ip = ip
        outbound.Comment = temp.Comment
        outbound.Blacklist = temp.Blacklist

        _, err = datastore.Put(c, keys[0], &outbound)
        if err != nil {
            c.Errorf("saveToDatastore: error writing to datastore %v", err)
            return 
        }

        c.Infof("saveToDatastore: updated existing frequentPoster record outbound.GetCount= %s", outbound.GetCount)

        return 
            
    }  // end count=1

    if count > 1 {  // this should not happen; if the record exists, it should be unique
        c.Warningf("saveToDatastore: UNEXPECTED ERROR: multiple frequent poster records for ip= ", ip)
        return 
    }

    // never get here
    return 

}

