//@flow
import store from '../index';
import {auth} from '../routes'
import qs from 'query-string'
import history from '../history';

require('formdata-polyfill')

const CONFIG_PATH = '/config.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'
const ONTOLOGY_PATH = '/ontology/core.json'
const DICTIONARY_PATH = '/ontology/data/json'

const dPrefix = {
   "bdr": {
      "C" : "Corporation",
      "E" : "Etext",
      "I" : "Item",
      "L" : "Lineage",
      "G" : "Place",
      "P" : "Person",    
      "R" : "Role",
      "PR": "Product",
      "T" : "Topic",
      "W" : "Work",
      "O" : "Taxonomy",
      "V" : "Volume",
      "UT": "Etext", // ?
   },
   "dila" : {
      "PL": "Place", 
      "A" : "Person"
   },
   "wd" : {
      "Q" : "Person"
   },
   "mbbt" : {
      "text": "Work"
   }
};

export function getEntiType(t:string):string {
   let p = t.replace(/^([^:]+):.*$/,"$1")
   if(p === "ola") return "Person" ;
   else if(p == "mbbt" ) return "Work" ; // [TODO]
   let v = t.replace(/^([^:]+:)?([ACEILGPQRTWOVU][RTL]?).*$/,"$2")
   //console.log("v",v,dPrefix[v])
   if(!dPrefix[p] || !dPrefix[p][v]) return "" ;
   else return dPrefix[p][v]; }


export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string, args?:{}) => Promise<*>
}

export class ResourceNotFound extends Error {};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string, args?:{}) => Promise<APIResponse>

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            if(process.env.NODE_ENV === 'test'){
               let {fetch} = require('whatwg-fetch')
               this._fetch = fetch
            }
            else if(options.fetch) this._fetch = options.fetch
            else if (window.fetch) this._fetch = window.fetch.bind(window)

        } else {
           if(process.env.NODE_ENV === 'test'){
              let fetch = require('whatwg-fetch')
              this._fetch = fetch
           }
           else this._fetch = window.fetch.bind(window);
        }

        console.log("api options",options,this,process.env.NODE_ENV)
      }

     async getURLContents(url: string, minSize : boolean = true,acc?:string,lang?:string[],binary:boolean=false,cookie:string): Promise<string> {

         const { isAuthenticated } = auth;

         const access_token = localStorage.getItem('access_token');
         const id_token = localStorage.getItem('id_token');
         //const expires_at = localStorage.getItem('expires_at');

         //console.log("access",id_token,access_token,isAuthenticated(),url,minSize,acc,cookie)

         let head = {}
         if(acc) head = { ...head, "Accept":acc }

         if(lang) head = { ...head, "Accept-Language":lang.join(",") }

         // CORS issue - to be continued
         let xhrArgs
         if(isAuthenticated() && url.match(/bdrc[.]io/)) {
            if(url.match(/setcookie/)) xhrArgs = { credentials: 'include' } //, 'mode':'no-cors'}
            if(!cookie) head = { ...head, "Authorization":"Bearer "+id_token }
         }

         let response = await this._fetch( url, { method:"GET",headers:new Headers(head), ...xhrArgs } )

         if (!response.ok) {
             if (response.status === 404) {
                 throw new ResourceNotFound('The resource does not exist.');
             }
             else if (response.status === 401) {
                 throw new ResourceNotFound('Restricted access');
             }
             else {
                console.error("FETCH pb",response)
                 throw new ResourceNotFound('Problem fetching the resource');
             }
         }

         console.log("FETCH ok",url,response )
         /*
         for(let c of response.headers.keys()) {
            console.log(c,response.headers.get(c))
         }
         */
         /*
         let cookie = response.headers.get("Set-Cookie")
         if(cookie) {
            console.log("cookie!",cookie)
         }
         */

         if(!binary) {
            let text = await response.text()
            //console.log("RESPONSE text",text)
            if(minSize && text.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }
            return text ;
         }
         else {
            let buffer = await response.arrayBuffer() ;
            //console.log("buffer",buffer,response)
            return buffer
         }
      }

/*
         return new Promise((resolve, reject) => {

             this._fetch( url ).then((response) => {

                 if (!response.ok) {
                     if (response.status === '404') {
                         throw new ResourceNotFound('The resource does not exist.');
                     }
                     else {
                        console.log("FETCH pb",response)
                         throw new ResourceNotFound('Problem fetching the resource');
                     }
                 }
                 console.log("FETCH ok",url,response)
                 response.text().then((reqText) => {
                     text = reqText;

                     //console.log("RESPONSE text",reqText)

                     if(minSize && reqText.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }

                     resolve(text);
                 }).catch((e) => {
                    reject(e);
                });
             }).catch((e) => {
                 reject(e);
             });
         });
     }
     */

    async loadConfig(): {}
    {
      try {
         let config =  JSON.parse(await this.getURLContents(this._configPath,false));
         console.log("config",config)
         return config ;
      }
      catch(e) {

         console.error("fetching config.json",e);

         let config =  JSON.parse(await this.getURLContents(this._configDefaultsPath,false));
         console.log("config-defaults",config)
         return config ;
      }
   }

       async loadManifest(url:string): Promise<string>
       {

            let manif =  JSON.parse(await this.getURLContents(url,false,null,["bo-Tibt"]));
            //console.log("manif",manif)
            return manif ;
      }

    async loadOntology(): Promise<string>
    {
         let onto =  JSON.parse(await this.getURLContents(this._ontologyPath,false));
         //console.log("onto",onto)
         return onto ;
   }

    async loadDictionary(): Promise<string>
    {
         let dico =  JSON.parse(await this.getURLContents(this._dictionaryPath,false));
         console.log("dico",dico)
         return dico ;
   }


    async loadResource(IRI:string): Promise<string>
    {

         //let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));try {
         try {
            
            let query = "ResInfo-SameAs"
            //let get = qs.parse(history.location.search)
            //if(get["cw"] === "none") query = "ResInfo"

            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let param = {"searchType":query,"R_RES":IRI,"L_NAME":"","LG_NAME":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET");
            
            console.log("r e source",param,data)
            

            /*
            const bdr  = "http://purl.bdrc.io/resource/";
            IRI = IRI.replace(new RegExp("(bdr:)|("+bdr+")"),"")
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/resource/"+IRI+".json" ;
            let data = await JSON.parse(await  this.getURLContents(url))

            console.log("resource",data)
            */


            return data ;
         }
         catch(e)
         {
            throw(e)
         }

   }


   async loadAnnoList(IRI:string): Promise<string>
   {
         if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
         //let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));try {
         try {
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;
            let param = {"searchType":"AnnCollection-forResource","R_RES":IRI,"L_NAME":"","LG_NAME":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET") //,"application/ld+json");
            console.log("r e source",data)
            return data ;
         }
         catch(e)
         {
            throw(e)
         }

   }

   async loadEtextInfo(IRI:string): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI

      //console.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/query/graph" ;
         let param = {"searchType":"Etext_base","R_RES":IRI,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET") //,"application/json");

         console.log("etextinfo",data) //JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }

   async loadEtextChunks(IRI:string,next:number=0,nb:number=10000): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

      //console.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/query/graph" ;
         let param = {"searchType":"Chunks","R_RES":IRI,"I_START":next,"I_END":next+nb,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //console.log("etextchunks",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }


   async loadEtextPages(IRI:string,next:number=0): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

      //console.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/query/graph" ;
         let param = {"searchType":"ChunksByPage","R_RES":IRI,"I_START":next,"I_END":next+10,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //console.log("etextchunks",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }




   async loadAssocResources(IRI:string): Promise<string>
   {
      let resource =  JSON.parse(await this.getURLContents(this._assocResourcesPath(IRI),false));
      console.log("assocResources",resource)
      return resource ;
   }

    testHost(host : string): Promise<boolean>
    {
      return new Promise((resolve, reject) =>
      {
         this._fetch(host+"").then((response) =>
         {
            if (response.ok)
            {
               console.log("response ok",host,response)
               resolve(true);
            }
            else
            {
               throw new Error("Connection to " +host+ " failed")
            }

         }).catch((e) =>
         {
            reject(e)
         })
      })
    }


   async getQueryResults(url: string, key:string, param:{}={}, method:string = "POST", accept:string="application/json",other?:{}): Promise<{}>
   {

      //console.log("key",key)

      let res = {}
      param = { "searchType":"Res_withType","LG_NAME":"bo-x-ewts","I_LIM":500, ...param }

      if(key.indexOf("\"") === -1) key = "\""+key+"\""
      if(param["L_NAME"] != "") param["L_NAME"] = key ;
      else { delete param["L_NAME"] ; delete param["LG_NAME"] ;  }

      if(param["searchType"] != "") url += "/"+param["searchType"];
      else delete param["I_LIM"] ;
      delete param["searchType"]

      if(accept === "application/json") param["format"] = "json"

      console.log("query",url,key,param,method,accept,other);

      // let body = Object.keys(param).map( (k) => k+"="+param[k] ).join('&') +"&L_NAME="+key
      //searchType=Res_withFacet&"+param+"L_NAME=\""+key+"\"",

      var formData = new FormData();
      for (var k in param) {
          formData.append(k, param[k]);
      }

      // (using formData directly as body doesn't seem to work...)
      let body = [ ...formData.entries() ]
                     .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))
                     .join('&')

      console.log("body",body,param);

      const access_token = localStorage.getItem('access_token');
      const id_token = localStorage.getItem('id_token');

      const { isAuthenticated } = auth;

      let response = await this._fetch( url + (method == "GET" && body != "" ? "?" + body : ""),
      {// header pour accéder aux résultat en JSON !
         method: method,
         ...( method == "POST" && {body:body} ),//body:body,
         headers: new Headers({
            "Accept": accept,
            ...other,
            // CORS issue - to be continued
            ...( isAuthenticated() && {"Authorization":"Bearer "+id_token } ),
         ...( method == "POST" && {"Content-Type": "application/x-www-form-urlencoded"})
         })
      })

      //console.log("apres fetch",response)

      if (!response.ok) {
         if (response.status === '404') {
             throw new ResourceNotFound('The search server '+url+' seem to have moved...');
         }
         else {
            console.log("FETCH pb",response)
             throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
         }
     }
     //console.log("FETCH ok",url,response)

     let txt = await response.text()

     //console.log("txt",txt)

     res = JSON.parse(txt)

     //console.log("res",res)


      //console.log("resolving",res)

      return res ;
   }

      /*
      return new Promise((resolve, reject) => {


          this._fetch( url,
          {// header pour accéder aux résultat en JSON !
            method: 'POST',
            body:body,
            headers:new Headers({
               "Content-Type": "application/x-www-form-urlencoded",
               "Accept": "application/json"
            })
         }).then((response) => {


              if (!response.ok) {
                  if (response.status === '404') {
                      throw new ResourceNotFound('The search server '+url+' seem to have moved...');
                  }
                  else {
                     console.log("FETCH pb",response)
                      throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
                  }
              }
              console.log("FETCH ok",url,response)

              response.text().then((req) => {


                  res = JSON.parse(req) //.results.bindings ;

                  console.log("resolving",res)

                  resolve(res);
              }).catch((e) => {
                 reject(e);
              });
          }).catch((e) => {
              reject(e);
          });
       });
      }
      */

   async _getResultsData(key: string,lang: string): Promise<{} | null> {
      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/query/table" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang});
           // let data = this.getSearchContents(url, key);

           return data ;
      } catch(e) {
           throw e;
      }
  }

     async _getStartResultsData(key: string,lang: string,typ:string[]): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/lib" ;
             let param = {"searchType":"rootSearchGraph","LG_NAME":lang}
             if(typ && typ.length >= 1 && typ[0] !== "Any") { param = { ...param, "searchType":(typ[0] === "Etext"?"Chunks":typ[0]).toLowerCase()+"FacetGraph" } }
             let data = this.getQueryResults(url, key, param,"GET");
             // let data = this.getSearchContents(url, key);

             return data ;
        } catch(e) {
             throw e;
        }
    }

      async _getAssocResultsData(key: string,typ:string): Promise<{} | null> {
         try {
              let config = store.getState().data.config.ldspdi
              let url = config.endpoints[config.index]+"/lib" ;
              let param = {"searchType":typ.toLowerCase()+"AllAssociations","R_RES":key,"L_NAME":"","LG_NAME":"",LG_NAME:"" }
              let data = this.getQueryResults(url, key, param,"GET");
              // let data = this.getSearchContents(url, key);

              return data ;
         } catch(e) {
              throw e;
         }
     }

     async getResultsSimpleFacet(key: string,lang: string,property:string): Promise<{} | null> {
        try {
            //console.log("simpleFacet start",key,lang,property)

             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query/table" ;
             let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_simpleFacet","R_PROP":property});

             //console.log("simpleFacet end",data)

             return data ;
        } catch(e) {
             throw e;
        }
    }

   async getResultsDatatypes(key: string,lang: string): Promise<{} | null> {
      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/query/table" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_allTypes_withCount"});

           console.log("datatypes",data)



           return data ;
      } catch(e) {
           throw e;
      }
  }

     async getResultsOneDatatype(datatype:string,key: string,lang: string): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query/table" ;
             let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_oneType","R_RES":":"+datatype});

             console.log("oneDatatype",data)

             return data ;
        } catch(e) {
             throw e;
        }
    }

         async getResultsOneFacet(key: string,lang: string,facet:{[string]:string}): Promise<{} | null> {
            try {


                 let config = store.getState().data.config.ldspdi
                 let url = config.endpoints[config.index]+"/query/table" ;
                 let params = {"LG_NAME":lang,"searchType":"Res_simpleFacet_1value"}

                 let i = 1
                 for(let k of Object.keys(facet))
                 {
                    params = { ...params, ["R_PROP"+i] : k, ["R_VAL"+i] : facet[k] };
                    i ++
                 }

                  let data = this.getQueryResults(url, key, params )

                 console.log("oneFacet",data)

                 return data ;
            } catch(e) {
                 throw e;
            }
        }

   async getResults(key: string,lang:string): Promise<{} | null> {
     let data = [];

     try {
         data = await this._getResultsData(key,lang)

         return data ;
      } catch(e) {
         throw e;
      }
  }

     async getStartResults(key: string,lang:string,types:string[]): Promise<{} | null> {
       let data = [];

       try {
           data = await this._getStartResultsData(key,lang,types)

           return data ;
        } catch(e) {
           throw e;
        }
    }

         async getAssocResults(key: string,types:string[]): Promise<{} | null> {
           let data = [];

           try {
               data = await this._getAssocResultsData(key,types)

               return data ;
            } catch(e) {
               throw e;
            }
        }

      _resourcePath(IRI:string): string {

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/resource/" + IRI + ".json";

          return path;
      }

      _assocResourcesPath(IRI:string): string {

         if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/lib/allAssocResource?R_RES=" + IRI;

          return path;
      }


     get _ontologyPath(): string {
        let path = ONTOLOGY_PATH;

       let config = store.getState().data.config.ldspdi
       let url = config.endpoints[config.index] ;

         path = url +  ONTOLOGY_PATH;
         
         // to use with ldspdi running locally
         path = "http://purl.bdrc.io" +  ONTOLOGY_PATH;

        return path;
    }

     get _dictionaryPath(): string {
        let path = DICTIONARY_PATH

       let config = store.getState().data.config.ldspdi
       let url = config.endpoints[config.index] ;

         path = url +  DICTIONARY_PATH;

         // to use with ldspdi running locally
         path = "http://purl.bdrc.io" +  DICTIONARY_PATH;

        return path;
    }


   get _configPath(): string {
      let path = CONFIG_PATH;
      if (this._server) {
          path = this._server + CONFIG_PATH;
      }

      console.log("path",path)

      return path;
  }
  get _configDefaultsPath(): string {
      let path = CONFIGDEFAULTS_PATH;
      if (this._server) {
          path = this._server + '/' + CONFIGDEFAULTS_PATH;
      }

      return path;
  }
}
