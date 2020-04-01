// @flow
import { ResizableBox } from 'react-resizable';
import TextField from '@material-ui/core/TextField';
import type Auth from '../Auth';
import _ from "lodash";
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar'
import Paper from '@material-ui/core/Paper';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/List';
import ListItemText from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Loader from 'react-loader';
import Collapse from '@material-ui/core/Collapse';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';
import ErrorIcon from '@material-ui/icons/Error';
import WarnIcon from '@material-ui/icons/Warning';
import Settings from '@material-ui/icons/SettingsSharp';
import TranslateIcon from '@material-ui/icons/Translate';
import Apps from '@material-ui/icons/Apps';
import Close from '@material-ui/icons/Close';
import Cancel from '@material-ui/icons/Cancel';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBox from '@material-ui/icons/CheckBox';
import CropFreeIcon from '@material-ui/icons/CropFree';
import CropDin from '@material-ui/icons/CropDin';
import CenterFocusWeak from '@material-ui/icons/CenterFocusWeak';
import CenterFocusStrong from '@material-ui/icons/CenterFocusStrong';
import FilterNone from '@material-ui/icons/FilterNone';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import withStyles from '@material-ui/core/styles/withStyles';
import gray from '@material-ui/core/colors/green';
import { Link } from 'react-router-dom'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage,faUserCircle,faSignOutAlt,faSlidersH } from '@fortawesome/free-solid-svg-icons'
import qs from 'query-string'
import store from "../index"
import FormGroup from '@material-ui/core/FormGroup';
import Popover from '@material-ui/core/Popover';

import {I18n, Translate, Localize } from "react-redux-i18n" ;

import LanguageSidePaneContainer from '../containers/LanguageSidePaneContainer';
import ResourceViewerContainer from '../containers/ResourceViewerContainer';
import {getOntoLabel} from './ResourceViewer';
import {getEntiType} from '../lib/api';
import {narrowWithString} from "../lib/langdetect"
import {sortLangScriptLabels, extendedPresets} from '../lib/transliterators';
import './App.css';

const adm   = "http://purl.bdrc.io/ontology/admin/" ;
const bda   = "http://purl.bdrc.io/admindata/";
const bdac  = "http://purl.bdrc.io/anncollection/" ;
const bdan  = "http://purl.bdrc.io/annotation/" ;
const bdo   = "http://purl.bdrc.io/ontology/core/"
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdr   = "http://purl.bdrc.io/resource/";
const bdu   = "http://purl.bdrc.io/resource-nc/user/" ;
const bf    = "http://id.loc.gov/ontologies/bibframe/";
const cbcp  = "https://dazangthings.nz/cbc/person/"
const cbct  = "https://dazangthings.nz/cbc/text/"
const dila  = "http://purl.dila.edu.tw/resource/";
const eftr  = "http://purl.84000.co/resource/core/" ;
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const mbbt  = "http://mbingenheimer.net/tools/bibls/" ;
const oa    = "http://www.w3.org/ns/oa#" ;
const ola   = "https://openlibrary.org/authors/" 
const owl   = "http://www.w3.org/2002/07/owl#" ; 
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#";
const rkts  = "http://purl.rkts.eu/resource/";
const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp  = tmp ;
const viaf  = "http://viaf.org/viaf/"
const wd    = "http://www.wikidata.org/entity/"
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

export const prefixesMap = { adm, bda, bdac, bdan, bdo, bdou, bdr, bdu, bf, cbcp, cbct, dila, eftr, foaf, oa, mbbt, owl, rdf, rdfs, rkts, skos, wd, ola, viaf, xsd, tmp }
export const prefixes = Object.values(prefixesMap) ;
export const sameAsMap = { wd:"WikiData", ol:"Open Library", ola:"Open Library", bdr:"BDRC", mbbt:"Marcus Bingenheimer", eftr:"84000" }

export function fullUri(id:string, force:boolean=false) {
   if(force && id.indexOf(":") === -1) id = bdo + id
   else for(let k of Object.keys(prefixesMap)) {
      id = id.replace(new RegExp(k+":"),prefixesMap[k])
   }
   return id ;
}

export function shortUri(id:string) {
   for(let k of Object.keys(prefixesMap)) {
      id = id.replace(new RegExp(prefixesMap[k]),k+":")  
   }
   return id.replace(/[/]$/,"") ;
}

const facetLabel = {
   "tree": "Genre / Topic",
   "relationInv": "Inverse Relation Type"
}

export const languages = {
   "zh":"lang.search.zh",
   "zh-hant":"lang.search.zhHant",
   "zh-hans":"lang.search.zhHans",
   "zh-latn-pinyin":"lang.search.zhLatnPinyin",
   "zh-x-phon-en":"lang.search.zhXPhonEn",
   "sa-x-iast":"lang.search.saXIast",
   "sa-x-ndia":"lang.search.saXNdia",
   "sa-deva":"lang.search.saDeva",
   "en":"lang.search.en",
   "pi":"lang.search.pi",
   "pi-x-iast": "lang.search.piXIast",
   "bo":"lang.search.bo",
   "bo-x-ewts":"lang.search.boXEwts",
   "bo-x-dts":"lang.search.boXDts",
   "bo-alalc97":"lang.search.boAlaLc",
   //"other":"lang.search.other"
   "inc":"lang.search.inc","sa":"lang.search.sa",
   "hans":"lang.search.hans","hant":"lang.search.hant",
   "deva":"lang.search.deva","newa":"lang.search.newa","sinh":"lang.search.sinh",
   "latn":"lang.search.ltn",
   "x-ewts":"lang.search.xEwts","x-dts":"lang.search.sDts","alalc97":"lang.search.alalc97","latn-pinyin":"lang.search.latnPinyin"
}

const searchLangSelec = {
   "zh-hant":"lang.search.zh"
}

const langSelect = [
   "zh-hant",
   "zh-latn-pinyin",
   "bo",
   "bo-x-ewts",
   "bo-x-dts",
   "bo-alalc97",
   "sa-x-ndia",
   "sa-x-iast",
   "sa-deva",
   "en",
   "pi-x-iast"
]

//const searchTypes = ["All","Work","Etext","Topic","Person","Place","Lineage","Corporation","Role"]
const searchTypes = [ "Work", "Person","Place","Topic","Lineage","Role","Corporation","Etext" ]

/*
export const langProfile = [
   "en",
   "bo-x-ewts",
   "sa-x-iast",
   "zh-x-phon-en",
   "zh-latn-pinyin",
   "pi-x-iast",
   "pi",
   "sa-deva",
   "sa-x-ndia",
   "bo",
   "bo-x-dts",
   "bo-alalc97",
   "zh-hans",
   "zh-hant",
   "zh"
]


export const langProfile = [
   "zh-hant",
   "zh-hans",
   "zh",
   "sa-deva",
   "sa-x-ndia",
   "sa-x-iast",
   "en",
   "pi",
   "pi-x-iast",
   "zh-latn-pinyin",
   "bo",
   "bo-x-ewts",
   "bo-x-dts",
   "bo-alalc97"
]
*/


export function highlight(val,k,expand,newline)
{
   //console.log("hi:",val,k,expand)

   if(expand && expand.value) val = expand.value

   val = val.replace(/(\[[^\]]*?)([↦])([^\]]*?\])/g,"$1$3$2");
   val = val.replace(/(\[[^\]]*?)([↤])([^\]]*?\])/g,"$2$1$3");
   val = val.replace(/(↦↤)|(\[ *\])/g,"");
   val = val.replace(/\[( *\(…\) *)\]/g," $1 ");

   if(!val.match(/↤/) && k)
      val = /*val.replace(/@.* /,"")*/ val.split(new RegExp(k.replace(/[ -'ʾ]/g,"[ -'ʾ]"))).map((l) => ([<span>{l}</span>,<span className="highlight">{k}</span>])) ;
   else //if (val.match(/↤.*?[^-/_()\[\]: ]+.*?↦/))
   {      
      val = val.split(/↦/)
      val = val.map((e,_idx) => { 
         //console.log("e",i,e,e.length)
         if(e.length) {
            let f = e.split(/↤/)
            if(f.length > 1) {
               let tail 
               if(newline && f[1].indexOf("\n\n") !== -1) { 
                  tail = f[1].split("\n\n")
                  tail = tail.map((i,idx) => [<span>{i}</span>,<br data-last={_idx >= val.length - 1 && idx === tail.length - 1}/>,<br/>])
               }
               else tail = [ <span>{f[1]}</span> ]
               return [<span className="highlight">{f[0]}</span>,...tail,<span></span>]
            }
            else {
               let tail 
               if(newline && f[0].indexOf("\n\n") !== -1) { 
                  tail = f[0].split("\n\n")
                  tail = tail.map( (i,idx) => [<span>{i}</span>,<br data-last={_idx >= val.length - 1 && idx === tail.length - 1}/>,<br/>])
               }
               else tail = [ <span>{f[0]}</span> ]
               return [...tail,<span></span>]
            }
         }
      })
   }    
   
   // else {
   //    let str = val.replace(/[\n\r]+/g," ").replace(/^.*?(↦([^↤]+)↤([-/_()\[\]: ]+↦([^↤]+)↤)*).*$/g,"$1").replace(/↤([-/_() ]+)↦/g,"$1").replace(/[↤↦]/g,"")
   //                .replace(/[\[\]]+/g,"")
   //    let ret = val.replace(/↦[^↤]+↤([-/_()\[\]: ]+↦[^↤]+↤)*/g,"↦↤")

   //    //console.log("str:",str,"=",ret)

   //    val = ret.split(/[\[\] ]*↦↤[\[\] ]*/).map((l) => ([<span>{l}</span>,<span className="highlight">{str}</span>])) ;
   // }
   

   val = [].concat.apply([],val);
   val.pop();
   return val;
}

const preferUIlang = [ bdo+"placeType", bdo+"workIsAbout", bdo+"workGenre", bdo+"role", bdo+"language", bdo+"script", adm+"metadataLegal", bdo+"personGender", bdo+"printMethod", bdo+"workGenre",
   tmp+"relationType", bdo+"material" ]

export function getLangLabel(that:{},prop:string="",labels:[],proplang:boolean=false,uilang:boolean=false,otherLabels:[],dontUseUI:boolean=false)
{
   if(labels && labels.length)
   {
      //console.log("getL",prop,labels,proplang);

      let langs = []
      if(that.state.langPreset) langs = that.state.langPreset
      else if(that.props.langPreset) langs = that.props.langPreset
      if(proplang || uilang || preferUIlang.indexOf(prop) !== -1) langs = [ that.props.locale, ...langs ]

      if(langs.indexOf(that.props.locale) === -1 && !dontUseUI) { 
         langs = [ ...langs, that.props.locale ]
      }            

      // move that to redux state ?
      langs = extendedPresets(langs)

      //console.log(JSON.stringify(labels,null,3))

      let sortLabels =  sortLangScriptLabels(labels,langs.flat,langs.translit)

      //console.log(JSON.stringify(sortLabels,null,3))

      if(otherLabels) {
         let labels = [ ...sortLabels ]
         labels.shift()
         for(let e of labels) otherLabels.push(e)
      }

      return sortLabels[0]

      /*
      let l,langs = [];
      if(that.state.langProfile) langs = [ ...that.state.langProfile ] ;
      if(proplang && that.props.language) langs = [ that.props.language, ...langs ]
      if(uilang && that.state.UI && that.state.UI.language) langs = [ that.state.UI.language, ...langs ]

      for(let lang of langs) {
         l = labels.filter((e) => ((e.value||e["@value"]) && (e["lang"] == lang || e["xml:lang"] == lang || e["@language"] == lang)))
         //console.log("l?",l,lang);
         if(l.length > 0) {
            //console.log("lang",lang,l)
            return l[0]
         }
      }
      if(!l || l.length == 0) l = labels.filter((e) => (e.value) || (e["@value"]))
      return l[0]
      */
   }
};

function getPropLabel(that, i, withSpan = true, withLang = false) {
   if(!that.props.dictionary) return 

   let label = that.props.dictionary[i], labels
   if(label) {
      labels = label[skos+"prefLabel"]
      if(!labels) labels = label["http://www.w3.org/2000/01/rdf-schema#label"]
   }
   else if(that.props.assoRes && that.props.assoRes[i]) labels = that.props.assoRes[i]
   else if(that.props.resources && that.props.resources[i]) { 
      labels = that.props.resources[i]
      if(labels) labels = labels[fullUri(i)]
      if(labels) labels = labels[skos+"prefLabel"]
   }

   let lang
   if(labels) {
      label = getLangLabel(that,"",labels) //,true)

      //console.log("label",i,label)

      if(label) {
         if(label.lang) lang = label.lang
         else if(label["@language"]) lang = label["@language"]
         else if(label["xml:lang"]) lang = label["xml:lang"]

         if(label.value) label = label.value
         else if(label["@value"]) label = label["@value"]

      }
   }
   else label = that.pretty(i)

   if(withSpan) return <span {...lang?{lang}:{}} >{label}</span>
   else if(!withLang) return label
   else return {value:label,lang}
}

export function getFacetUrl(filters,dic){
   let str = "";
   if(filters.facets) { 
      if(dic) dic = Object.keys(dic).reduce ( (acc,f) => ({ ...acc, [dic[f]]:f}),{})
      for(let k of Object.keys(filters.facets)) {
         let vals = filters.facets[k]
         if(vals.val) vals = vals.val
         if(!vals.includes("Any")) str += vals.map(v => "&f="+dic[k]+","+(filters.exclude[k] && filters.exclude[k].indexOf(v) !== -1?"exc":"inc")+","+shortUri(v)).join("")
      }
   }
   console.log("gFu",str,filters,dic)
   return str
}

export function top_right_menu(that)
{

  return (
     <div class="nav">
       <div>
         <div>
            <a href="https://bdrc.io/" target="_blank"><img src="/BDRC.svg"/></a>
            <Link to="/"><img src="/LIBRARY.svg"/></Link>
         </div>
         <div id="login">
        <IconButton style={{marginLeft:"15px"}}  onClick={e => that.props.onToggleLanguagePanel()}>
          <FontAwesomeIcon style={{fontSize:"28px"}} icon={faLanguage} title="Display Preferences"/>
        </IconButton> 
        {
          !that.props.auth.isAuthenticated() && (
              <IconButton onClick={that.props.auth.login.bind(that,that.props.history.location)} title="Log in">
                <FontAwesomeIcon style={{fontSize:"28px"}} icon={faUserCircle} />
              </IconButton>
            )
        }
        {
          that.props.auth.isAuthenticated() && (
              [<IconButton title="User Profile" onClick={(e) => { that.props.onUserProfile(that.props.history.location); that.props.history.push("/user");    }}>
                  <FontAwesomeIcon style={{fontSize:"28px"}} icon={faUserCircle} />
              </IconButton>,
         
              <IconButton onClick={that.props.auth.logout.bind(that,that.props.history.location.pathname!=="/user"?that.props.history.location:"/")} title="Log out">
                <FontAwesomeIcon style={{fontSize:"28px"}} icon={faSignOutAlt} />
              </IconButton> ]
            )
        }
         </div>
       </div>
     </div>
  )
}

function getLang(label) 
{
   let lang
   if(label["@language"]) lang = label["@language"]
   else if(label["lang"]) lang = label["lang"]
   else if(label["xml:lang"]) lang = label["xml:lang"]
   return lang
}

function getVal(label) 
{
   let val
   if(label["@value"]) val = label["@value"]
   else if(label["value"]) val = label["value"]
   return val
}

const TagTab = {
   "Abstract Work":CropFreeIcon,
   "Work Has Expression":CenterFocusStrong,
   "Work Expression Of":CenterFocusWeak,
   "Work":CropDin
}

const styles = {
  checked: {
    color: "rgb(50,50,50)",
},
  refine: {
    color: "gb(50,50,50)",
  },
};

type Props = {
   auth:Auth,
   config:{
      ldspdi:{
         endpoints:string[],
         index:number
      }
   },
   facets?:{[string]:boolean|{}},
   searches:{[string]:{}},
   resources:{[string]:{}},
   hostFailure?:string,
   langIndex?:integer,
   loading?:boolean,
   keyword?:string,
   language?:string,
   prefLang?:string,
   locale?:string,
   datatypes:boolean|{},
   history:{},
   ontology:{},
   dictionary:{},
   ontoSearch:string,
   rightPanel?:boolean,
   failures?:{},
   assoRes?:{},
   sortBy?:string,
   instances?:{},
   isInstance?:boolean,
   onResetSearch:()=>void,
   onOntoSearch:(k:string)=>void,
   onStartSearch:(k:string,lg:string,t?:string)=>void,
   onSearchingKeyword:(k:string,lg:string,t?:string[])=>void,
   onGetInstances:(uri:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void,
   onGetFacetInfo:(k:string,lg:string,f:string)=>void,
   onCheckFacet:(k:string,lg:string,f:{[string]:string})=> void,
   onUpdateFacets:(key:string,t:string,f:{[string]:string[],m:{[string]:{}}},cfg:{[string]:string})=> void,
   onGetResource:(iri:string)=>void,
   onSetPrefLang:(lg:string)=>void,
   onToggleLanguagePanel:()=>void,
   onUserProfile:(url:{})=>void,
   onUpdateSortBy:(i:string,t:string)=>void,
   onGetContext:(iri:string,start:integer,end:integer)=>void,
   onGetDatatypes:(k:string,lg:string)=>void

}

type State = {
   anchor:{[string]:{}},
   id?:string,
   loading?:boolean,
   //willSearch?:boolean,
   language:string,
   langOpen:boolean,
   customLang?:string[],
   langPreset?:string[],
   langDetect?:string[],
   checked?:string,
   unchecked?:string,
   keyword:string,
   newKW:string,
   dataSource : string[],
   leftPane?:boolean,
   LpanelWidth:number,
   closeLeftPane?:boolean,
   uriPage?:integer,
   backToWorks?:string,
   filters:{
      datatype:string[],
      facets?:{[string]:string[]},
      exclude:{[string]:boolean},
      preload:{}
   },
   collapse:{ [string] : boolean },
   loader:{[string]:Component<*>},
   facets? : string[],
   autocheck?:boolean,   
   paginate:{},   
   repage:boolean,
   instances?:{},
   results:{
      [string]:{
         message:[],
         counts:{},
         types:[],      
         paginate:{index:number,pages:number[],n:number[],goto?:number}
      }      
   },
   assoRes?:{},
   locale:string
}

class App extends Component<Props,State> {
   _facetsRequested = false;
   _customLang = null ;
   _menus = {}
   _refs = {}
   _scrollTimer = null


   constructor(props : Props) {
      super(props);      

      this.requestSearch.bind(this);
      this.handleCheck.bind(this);
      this.handleResults.bind(this);
      this.handleResOrOnto.bind(this);
      this.makeResult.bind(this);
      this.render_filters.bind(this);

      let get = qs.parse(this.props.history.location.search)

      let lg = "bo-x-ewts"
      if(get.p) lg = ""
      else if(get.lg) lg = get.lg

      let kw = "", newKW
      if(get.q) kw = get.q.replace(/"/g,"")
      if(kw) newKW = kw

      let types = [ "Work" ] //[ ...searchTypes.slice(1) ]
      let e = types.indexOf("Etext")
      if(e !== -1) { 
         delete types[e]
         types = types.filter(e => e)
         //console.log("types",types)
      }

      // x reset facets when switching to instances (use w=)
      // + use page number given in url
      // + switching back when returning to Works ? use "w="+encoded url
      // TODO 
      // - hide Works before instances are displayed 

      let sortBy = get.s

      this.state = {
         language:lg,
         langOpen:false,
         UI:{language:"en"},
         filters: {
            datatype:get.t?get.t.split(","):["Any"],
         },
         collapse:{},
         sortBy,
         searchTypes: get.t?get.t.split(","):types,
         dataSource: [],         
         newKW,
         loader:{},
         paginate:{index:0,pages:[0],n:[0]},
         anchor:{},
         LpanelWidth:375
         //leftPane:false //(window.innerWidth > 1400 && this.props.keyword),
         
      };


      if(langSelect.indexOf(lg) === -1) this.state = { ...this.state, customLang:[lg]}

      console.log('qs',get,this.state)


   }



   componentDidUpdate() {
      
      console.log("didU",this.state) //,this._refs)

      let get = qs.parse(this.props.history.location.search)

      let n, scrolled
      if(get.n) {
         n = get.n
         if(this._refs[n] && this._refs[n].current && this.state.scrolled !== n)  {
            this._scrollTimer = setInterval(((that) => () => { 
               
               if(that._refs[n] && that._refs[n].current) that._refs[n].current.scrollIntoView()


               //else if(n === 0 && that._refs["logo"].current) window.scrollTop(0) //TODO scroll to top of window when changing page

               console.log("timer")
            })(this),10) 

            setTimeout(((that) => () => { clearInterval(this._scrollTimer)})(this),1000)

            scrolled = n
         }
      }
      
      let pg 
      if(get.pg) pg = Number(get.pg) - 1

      let backToWorks
      if(get.w) backToWorks = decodeURIComponent(get.w)

      let filters 
      let collapse = { ...this.state.collapse }
      let exclude = {}
      let preload = {}
      let facets= {} 
      let encoded = ""
      if(!get.f) filters = { datatype: this.state.filters.datatype, encoded }            
      else { 
         encoded = ""
         let F = get.f
         if(!Array.isArray(F)) F = [F]
         for(let f of F) {
            if(encoded) encoded += "&"
            encoded += "f="+f
            let val = f.split(",")
            if(val.length === 3) {
               let exc =  val[1] === "exc"
               collapse[val[0]] = true
               if(!preload[val[0]]) preload[val[0]] = []
               preload[val[0]].push(fullUri(val[2]))
               if(exc) {
                  if(!exclude[val[0]]) exclude[val[0]]= []
                  exclude[val[0]].push(fullUri(val[2]))
               }
            }
         }
         filters = {
            datatype:get.t?get.t.split(","):["Any"],
            exclude,
            facets,
            preload,
            encoded
         }
      }

      //console.log("encoded",encoded)

      if(this.state.uriPage !== pg || this.state.backToWorks !== backToWorks || (encoded !== this.state.filters.encoded ) || (scrolled && this.state.scrolled !== scrolled) )
         this.setState({...this.state, repage:true, uriPage:pg, backToWorks, scrolled, collapse, ...(filters?{filters}:{})})

   }

   requestSearch(key:string,label?:string,lang?:string,forceSearch:boolean=false)
   {
      console.log("key",key,label,this.state.searchTypes)

      let _key = ""+key
      if(!key || key == "" || !key.match) return ;
      if(!key.match(/:/)) {
        if(key.indexOf("\"") === -1) key = "\""+key+"\""
        key = encodeURIComponent(key) // prevent from losing '+' when adding it to url
      }

      let searchDT = this.state.searchTypes
      if(!label) label = searchDT
      if(!label || label.length === 0 || label.length > 1) { 
         searchDT = [ "Any" ]
         label = [ "Any" ] 
      }
      if(label.indexOf("Any") !== -1) label = "Any" 
      else label = label.join(",")

      let state = { ...this.state, dataSource:[], leftPane:true, filters:{ datatype:[ ...searchDT ] } }
      this.setState(state)

      console.log("search::",key,_key,label) //,this.state,!global.inTest ? this.props:null)
      
      if(_key.match(/^[UWPGRCTILE][A-Z0-9_]+/) || prefixesMap[key.replace(/^([^:]+):.*$/,"$1")])
      {
         if(!forceSearch) {
            if(_key.indexOf(":") === -1) _key = "bdr:"+_key
            this.props.history.push({pathname:"/show/"+_key})
         }
         else {

            if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work"].indexOf(f) !== -1)[0]
            this.props.history.push({pathname:"/search",search:"?r="+key+(label?"&t="+label:"")})
         }


      }
      else if(key.match(/^[^:]*:[^ ]+/))
      {
         this.props.history.push({pathname:"/search",search:"?p="+key})

      }
      else {

         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+(lang?lang:this.getLanguage())+"&t="+label})
         
         // TODO add permanent filters (here ?)
      }

      /*
      else if(label === "Any") // || ( !label)) // && ( this.state.filters.datatype.length === 0 || this.state.filters.datatype.indexOf("Any") !== -1 ) ) )
      {
         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t=Any"})
      }
      else if (label || this.state.filters.datatype.filter((f)=>["Person","Work","Etext"].indexOf(f) !== -1).length > 0)
      {
         if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work","Etext"].indexOf(f) !== -1)[0]

         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t="+label})
      }
      else 
      {
         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t=Any"})
      }
      */


   }

   getEndpoint():string
   {
      return this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
   }

   getLanguage():string
   {
      return this.state.language
      /*
      if(lang && lang === "other")
         lang = this.state.customLang
      return lang
      */
   }

   static getDerivedStateFromProps(prop:Props,state:State)
   {
      let s ;

      let props = { ...prop }

      if(props.keyword) { 
         document.title = /*""+*/ props.keyword+" search results - Public Digital Library"
         
      }

      if(props.assoRes && (!state.assoRes || Object.keys(state.assoRes).length !== Object.keys(props.assoRes).length)) {

         if(!s) s = { ...state }
         s.assoRes = { ...props.assoRes }
         s.repage = true
      }

      if(props.topicParents && state.filters.facets && state.filters.facets[bdo+"workGenre"]) {
         if(!s) s = { ...state }
         let genre = state.filters.facets[bdo+"workGenre"]
         if(genre.val) genre = genre.val
         for(let p of genre) 
            if(props.topicParents[p]) 
               for(let q of props.topicParents[p]) 
                  if(s.collapse[q] === undefined) 
                     s.collapse[q] = true
      }

      if(state.filters.preload && state.sortBy && !props.sortBy) { 
         
         if(!s) s = { ...state }

         props.onUpdateSortBy(s.sortBy.toLowerCase(),s.filters.datatype[0])
         
         delete s.sortBy

      }

      if(state.filters.preload && props.keyword && props.config && !state.filters.datatype.includes("Any")) {
         
         if(!s) s = { ...state }

         if(s.filters.preload && s.filters.preload !== true) {
            let dic = props.config.facets[state.filters.datatype[0]]
            if(dic) for(let k of Object.keys(s.filters.preload)) {
               s.filters.facets[dic[k]] = s.filters.preload[k]
            }
            let exclude = {}
            //console.log("exc1",JSON.stringify(s.filters.exclude,null,3))
            if(dic) for(let k of Object.keys(s.filters.exclude)) {
               exclude[dic[k]] = s.filters.exclude[k] 
            }
            s.filters.exclude = exclude
            //console.log("exc2",JSON.stringify(exclude,null,3))

            s.filters.preload = true

         }         
         
         if(props.searches && props.searches[s.filters.datatype[0]] && props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language] && props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata )
         {
            delete s.filters.preload

            let facets = { ...s.filters.facets }
            facets = Object.keys(facets).reduce((acc,f) => {
                  if(facets[f].indexOf && facets[f].indexOf("Any") !== -1) return acc ;
                  else if(facets[f].val && facets[f].val.indexOf("Any") !== -1) return acc ;
                  else return { ...acc, [f]:facets[f] }
               },{})

            console.log("facets",facets,props.loading)

            if(!props.loading) 
               props.onUpdateFacets(
                  props.keyword+"@"+props.language,
                  s.filters.datatype[0],
                  facets,
                  s.filters.exclude,
                  props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata,
                  props.config.facets[s.filters.datatype[0]]
               )
            else 
               setTimeout(() => {
                  props.onUpdateFacets(
                  props.keyword+"@"+props.language,
                  s.filters.datatype[0],
                  facets,
                  s.filters.exclude,
                  props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata,
                  props.config.facets[s.filters.datatype[0]]
               )}, 1000);
            
         }
      }


      if(!state.newKW || state.newKW !== props.keyword || props.keyword === null) { 
         if(!s) s = { ...state }
         if(s.newKW !== props.keyword) {
            s.newKW = props.keyword
            s.keyword = props.keyword
            if(!props.keyword) s.leftPane = false ;
         }

      }


      //console.log("collap?",JSON.stringify(state.collapse,null,3))

      
      // TODO deprecate in favor of query modification      
      if(props.language == "" && (!props.resources || !props.resources[props.keyword]))
      {
         console.log("gRes?",props.resources,props.keyword);
         props.onGetResource(props.keyword);
      }
     

      /*
      // update when datatype filter has changed 
      if(state.filters && state.filters.datatype) {
         let get = qs.parse(props.history.location.search)
         let d_url = (get.t?get.t.split(","):[])
         if(d_url.length) {
            let d_sta = state.filters.datatype
            if(d_sta.filter(i => !d_url.includes(i)).length > 0) {
               if(!s) s = { ...state }
               s = { ...s, filters : { ...s.filters, datatype : d_url }, repage:true }
               console.log("filt::",d_url)
            }
            //console.log("what...",d_sta,d_url)
         }
      }
      */

      if(!state.leftPane && props.keyword && !state.closeLeftPane) {
         if(!s) s = { ...state }
         s.leftPane =  true 
      }

      if(props.keyword && props.datatypes && props.datatypes.hash && (!props.datatypes.metadata || Object.keys(props.datatypes.metadata).length === 0) ) {
         if(!s) s = { ...state }
         s.leftPane = false 

         //console.log("no leftPane")
      }

      
      // update when language has changed
      let eq = true
      if(props.langPreset && state.langPreset) for(let i = 0 ; i < props.langPreset.length && eq; i ++ ) { eq = eq && props.langPreset[i] === state.langPreset[i] ; }
      else eq = false ;
      if(!eq) {
         if(!s) s = { ...state }
         let langDetect = [ "ewts", "iast", "pinyin" ]
         let langP = [], i
         if(props.langPreset) { 
            langP = props.langPreset.map(p => p.replace(/^.*?(ewts|iast|pinyin)?$/,"$1")).filter(e => e)
            langDetect = langDetect.map(d => ({d,i:(i=langP.indexOf(d))!==-1?i:99}))
            console.log("langP",langDetect,langP,props.langPreset)         
            langDetect = _.orderBy(langDetect, ["i","d"],["asc","asc"]).map(v => v.d)
         }
         s = { ...s, langPreset:props.langPreset, repage:true, langDetect }
         if(props.langIndex !== undefined ) s = { ...s, language:props.langPreset[0] }

      }

      if(props.locale !== state.locale)
      {
         if(!s) s = { ...state } 
         s = { ...s, locale: props.locale, repage: true } 

      }

      console.log("gDsFp",eq,props,state,s,state.id,state.LpanelWidth)

      // pagination settings
      let d, newid = state.filters.datatype.sort()+"#"+props.keyword+"@"+props.language      
      if(state.id !== newid && props.keyword) { // && props.language) { 
         if(!s) s = { ...state }

         /*
         let fromAny2Work = state.id && state.filters.datatype.indexOf("Work") !== -1 && state.id.match(/^Any/)
         if(!state.id || !(sameKW && fromAny2Work)) 
         */   

         let sameKW = state.id && state.id.match(new RegExp("#"+props.keyword+"@"+props.language+"$"))
         

         if(!sameKW || (state.filters.datatype.length > 1 || state.filters.datatype.indexOf("Any") !== -1)) { //((state.filters.datatype.indexOf("Work") !== -1 || state.filters.datatype.indexOf("Any") !== -1) && (!state.id || state.filters.datatype.length > 1 || (!state.id.match(/Work/)&&!state.id.match(/Any/)) ) ) )
            for(let c of ["Other","ExprOf", "HasExpr", "Abstract"]) if(s.collapse[c] != undefined) delete s.collapse[c]         
            
            // + "purge cache" when changing keyword
            // TODO
            // ? investigate why pagination changes when back from instances ("191 -> 197")
            
            s.results = {}
         }
         //s.id = newid
         s.paginate = {index:0,pages:[0],n:[0]}         
         s.repage = true 
         if(sameKW && /*state.id.match(/Work/) &&*/ state.results[state.id] && state.results[state.id].bookmarks && Object.keys(state.results[state.id].bookmarks).length) {            
            if(!s.results) s.results = {}
            s.results[newid] = { bookmarks: state.results[state.id].bookmarks }
         }

         console.log("new id",state.id,newid,sameKW,state.filters.datatype,s.results&&s.results[newid]?JSON.stringify(s.results[newid].bookmarks,null,3):null)
         
         //console.log("collap!",JSON.stringify(state.collapse,null,3))

      }
      else {
         newid = null
      }

      let needRefresh, time, current ;
      if(state.id && !newid) {
         if(!state.results || !state.results[state.id] || !state.results[state.id].results) //|| !state.results[state.id].results.resLength //|| !Object.keys(state.results[state.id].results).length
         {
            needRefresh = true
            time = 1
            console.log("refreshA",time)
         }
         else {
            current = state.results[state.id].results.time
            let k = props.keyword+"@"+props.language
            if(props.searches && props.searches[k]) { // && props.searches[k].time > state.results[state.id].results.time) {
               needRefresh = true ;
               time = props.searches[k].time
               console.log("refreshB",time)
            }
            for(let d of ["Etext","Person","Work","Place","Topic","Corporation","Role","Lineage"]) {
               if(props.searches && props.searches[d] && props.searches[d][k]) {
                  if(!time || props.searches[d][k].time > time) { 
                     time = props.searches[d][k].time 
                     needRefresh = true 
                     console.log("refreshC",time,d,state.id,current)
                  }
               }  
            }      
            //|| (state.id.match(/Etext/) && state.results[state.id].results && state.results[state.id].results.results && state.results[state.id].results.results.bindings && !state.results[state.id].results.results.bindings.etexts)         
            //|| (state.id.match(/Work#/) && state.results[state.id].results && props.searches && props.searches["Work"] && props.searches["Work"][props.keyword+"@"+props.language] && state.results[state.id].results.time < props.searches["Work"][props.keyword+"@"+props.language])
         }
      }

      // 
      if(state.id && needRefresh && time && (!current || time > current))
      {
         //console.group("NEED REFRESH")

         if(props.searches[props.keyword+"@"+props.language] && (!time || time == 1)) { 
            time = props.searches[props.keyword+"@"+props.language].time
         }

         console.log("K", props.keyword, time, current)

         let results
         if(state.filters.datatype.indexOf("Any") !== -1 || state.filters.datatype.length > 1 || state.filters.datatype.filter(d => ["Work","Etext","Person","Place","Topic","Role","Corporation","Lineage"].indexOf(d) === -1).length ) {
            results = { ...props.searches[props.keyword+"@"+props.language] }
            //console.log("any")
         }
         //console.log("Ts1",JSON.stringify(state.searchTypes,null,3),JSON.stringify(state.filters.datatype,null,3))

         let Ts = [ ] //[ ...state.searchTypes.filter(e => e !== "Any") ]
         for(let dt of state.filters.datatype) { 
            if(dt === "Any") for(let t of searchTypes.slice(1)) { if(Ts.indexOf(t) === -1) Ts.push(t) }
            else if(Ts.indexOf(dt) === -1) Ts.push(dt)
         }
         
         console.log("Ts",Ts) //,props.searches,props.keyword+"@"+props.language,props.searches[props.keyword+"@"+props.language])

         let merge 
         if(props.searches[props.keyword+"@"+props.language] !== undefined || props.language === "") for(let dt of Ts) { 
            
            let res ;
            if(props.searches[dt]) res = { ...props.searches[dt][props.keyword+"@"+props.language] }
               
            if(!props.language) {
               results = { results:{ bindings:{} } }
            }
            else if(!results) {
               results = { ...props.searches[props.keyword+"@"+props.language] }
               if(results) { results = { time:results.time, results: { bindings:{ ...results.results.bindings } } }; }
               else results = { results: { time, bindings:{ } } }
            }
            
            let dts = dt.toLowerCase()+"s"
            if(!merge) merge = {}

            console.log("dts",dts,results,res)

            if(!res || !res.results || !res.results.bindings || !res.results.bindings[dts]) { 

               if(results.results && results.results.bindings[dts]) merge[dts] = { ...results.results.bindings[dts] } 
            }
            else {


               merge[dts] = { 
                  ...Object.keys(res.results.bindings[dts]).reduce( (acc,k) =>{

                        let m = [ ...res.results.bindings[dts][k].map(p => (p.type === tmp+"labelMatch"?{...p, type:tmp+"prefLabelMatch"}:p)), //.filter(p => (!p.value || !p.value.match( /*/([Aa]bstract)*/ /([↦↤])/)) /*&& (!p.type || !p.type.match(/[Mm]atch|[Ee]xpression/))*/ ), 
                                 ...(!results.results.bindings[dts]||!results.results.bindings[dts][k]||!props.language?[]:results.results.bindings[dts][k]) ]

                        //console.log("m?",dts,k,m.length) //,m)

                        return {
                           ...acc, 
                           [k]:m 
                        }
                     }, {}),

                  ...(!results.results.bindings[dts]||!props.language?[]:Object.keys(results.results.bindings[dts]).reduce( (acc,k) => {
                        return {
                           ...acc, 
                           ...(!res.results.bindings[dts][k]?{[k]:results.results.bindings[dts][k]}:{})
                        }
                  },{}))
               } 

               // merge[dts] = { ...merge[dts], ...res.results.bindings[dts] } 
               /*...Object.keys(res.results.bindings[dts]).reduce( (acc,k) =>{
                  
                  return {
                     ...acc, 
                     [k]:[ ...res.results.bindings[dts][k].filter( p => (!time || !p.value || !p.value.match(/[Aa]bstract|[Mm]atch/) || !p.type || !p.type.match(/[Ee]xpression/)))),                      
                           ...(!time||dts!=="works"?[]:results.results.bindings[dts][k].filter( p => (!p.type || !p.type.match(/[Mm]atch/))))
                        ] 
                  }
               }, {}) } */

            }
            

            //console.log("res!",dts,JSON.stringify(merge[dts],null,3))
         }         
         if(merge) { 
            if(!results.results) results = { results: {} }
            else results = { ...results, results: { ...results.results } }
            results.results.bindings = { ...merge }
         }
         

         //console.log("rootres",JSON.stringify(results,null,3))

         /*
         if(!results) {

            if(Ts.indexOf("Etext")!==-1 && props.searches["Etext"] && props.searches["Etext"][props.keyword+"@"+props.language])
            {
               console.log("etexts?",props.searches["Etext"][props.keyword+"@"+props.language])
               results = { ...props.searches["Etext"][props.keyword+"@"+props.language] }
            }
            ////results = { results:{ bindings:{} }, numResults:0 }
         }
         */
         if(results) {

            /* deprecated - no more abstract works
            if(results && results.results && results.results.bindings && results.results.bindings.works) {

               let works = results.results.bindings.works

               let ordered = Object.keys(works).sort((a,b) => {
                  let propAbsA = works[a].filter((e)=>(e.value.match(/AbstractWork/)))
                  let propAbsB = works[b].filter((e)=>(e.value.match(/AbstractWork/)))
                  let propExpA = works[a].filter((e)=>(e.type.match(/HasExpression/)))
                  let propExpB = works[b].filter((e)=>(e.type.match(/HasExpression/)))
                  let propExpOfA = works[a].filter((e)=>(e.type.match(/ExpressionOf/)))
                  let propExpOfB = works[b].filter((e)=>(e.type.match(/ExpressionOf/)))

                  if(propAbsA.length > 0) return -1 ;
                  else if(propAbsB.length > 0) return 1 ;
                  else if(propExpA.length > 0 && propExpB.length == 0) return -1 ;
                  else if(propExpB.length > 0 && propExpA.length == 0) return 1 ;
                  else if(propExpOfA.length > 0 && propExpOfB.length == 0) return -1 ;
                  else if(propExpOfB.length > 0 && propExpOfA.length == 0) return 1 ;
                  else return 0;
               })

               let tmp = {}
               for(let o of ordered) { tmp[o] = works[o]; 
               
                  //console.log("o",o,tmp[o].filter(e => e.value && e.value.match(/[Aa]bstract/)))
               }
               results.results.bindings.works = tmp
               // results = ordered.reduce((acc,k) => { acc[k]=results[k]; },{})
            }
            */

            if(!s) s = { ...state }
            if(!s.results) s.results = {}
            if(!s.results[s.id]) s.results[s.id] = {}
            //if(s.results[s.id].bookmarks) delete s.results[s.id].bookmarks
            if(results && results.results && results.results.bindings && Object.keys(results.results.bindings).length) {
               s.results[s.id].results = results        
               s.results[s.id].repage = true
               //s.results[s.id].paginate = {index:0,pages:[0],n:[0]}
            }
            if(time && s.results[s.id].results) s.results[s.id].results.time = time    

            if(needRefresh && results.results && results.results.bindings && Object.keys(results.results.bindings).length) { 
               s.repage = true
               
               // > pagination bug
               // s.paginate = {index:0,pages:[0],n:[0]}   
            }

            //console.log("s.id",s.id,s.results[s.id],time)        
         }

         //console.groupEnd()
      }


      if(props.instances) {

         let refresh = false
         if( !state.instances || (Object.keys(props.instances).length !== Object.keys(state.instances).length) ) {
            refresh = true
         }

         /*
         console.log("inst ref",refresh,JSON.stringify(Object.keys(props.instances)))
         if(state.instances) console.log(JSON.stringify(Object.keys(state.instances)))
         */
         
         if(refresh)
         {
            if(!s) s = { ...state }

            s.instances = { ...props.instances }
            s.repage = true
         }
      }

      if(props.isInstance) {
         
         if(!s) s = { ...state }

         s.filters = { ...s.filters, instance: props.keyword }

      }

      if(s) { 
         console.log("newS",s)
         return s ;
      }
      else return null;
   }


      // console.log("newProps.facets",newProps.facets)


/*
   handleCheckFacet = (ev:Event,prop:string,lab:string[],val:boolean) => {

      let state =  this.state

      let propSet ;
      if(state.filters.facets) propSet = state.filters.facets[prop]

      let newF ;
      if(prop == bdo+"workGenre") {
         if(!val) lab = ["Any"]
         //newF = { ...prop.map(p => ({ [p] : lab })).reduce((e,acc) => ({...acc,...e}),{}) }
         newF = { [prop] : { alt : [ prop, bdo + "workIsAbout", tmp + "etextAbout" ], val : lab } }
      }
      else
      {
         newF = { [prop] : lab }
      }

      console.log("checkF",prop,lab,val,newF)

      state = { ...state, paginate:{index:0,pages:[0],n:[0]}, repage: true }
      

      if(val || propSet)
      {
         let facets = { ...state.filters.facets, ...newF }
         state = {  ...state, filters: {  ...state.filters, facets } }

         if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1 && this.props.searches && this.props.searches[this.state.filters.datatype[0]])          
           this.props.onUpdateFacets(this.props.keyword+"@"+this.props.language,this.state.filters.datatype[0],Object.keys(facets).reduce((acc,f) => {
              if(facets[f].indexOf && facets[f].indexOf("Any") !== -1) return acc ;
              else if(facets[f].val && facets[f].val.indexOf("Any") !== -1) return acc ;
              else return { ...acc, [f]:facets[f] }
           },{}),this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].metadata,this.props.config.facets[this.state.filters.datatype[0]]);
      }      
      //else if(propSet)
      //{
      //   state = {  ...state, filters: {  ...state.filters, facets: { ...state.filters.facets, ...newF } } }
      //}

      this.setState( state )
   }
   */

   handleSearchTypes = (ev:Event,lab:string,val:boolean) => {

      if(lab === "All" ) lab = "Any"

      console.log("checkST::",this,lab,val)

      if(!val) {

         let dt = [ ...this.state.searchTypes ]

         if(lab === "Any") { dt = [] ; }
         else 
         {
            if(dt.indexOf("Any") !== -1) { dt = [ ...searchTypes.slice(1) ]; }
            let i ;
            if((i = dt.indexOf(lab))   !== -1) { delete dt[i]; }
            dt = dt.filter(e => e);
         }

         this.setState( { ...this.state, searchTypes:dt }  );
      }
      else {
         let dt = [ ...this.state.searchTypes ]         
         
         if(dt.indexOf(lab) === -1 && dt.indexOf("Any") === -1) dt.push(lab);

         //if(searchTypes.slice(1).filter(i => !dt.includes(i)).length == 0 || lab === "Any" ) { dt = [ "Any" ] }

         this.setState( { ...this.state, searchTypes:dt }  );
      }
   }

   reverseSortBy(ev,check) {

      let sortBy = this.props.sortBy
      if(!sortBy) sortBy = "popularity"

      if(sortBy) {

         if(sortBy.endsWith("reverse") && !check) sortBy = sortBy.replace(/ reverse$/,"")
         else if(!sortBy.endsWith("reverse") && check) sortBy = sortBy+ " reverse"

         if(sortBy !== this.props.sortBy) this.updateSortBy(ev,true,sortBy,true)
      }

   }

   updateSortBy(ev,check,i,fromReverse = false) {

      let sortBy = this.props.sortBy
      if(!sortBy) sortBy = "popularity"

      if(sortBy.endsWith("reverse") && !fromReverse) i = i + " reverse"

      if(check && (!this.props.sortBy || i !== this.props.sortBy)) {            

         let {pathname,search} = this.props.history.location
         
         this.props.history.push({pathname,search:search.replace(/(&s=[^&]+)/g,"")+"&s="+i.toLowerCase()})         
         
      } 
   }

   handleCheckFacet = (ev:Event,prop:string,lab:string[],val:boolean,excl:boolean=false) => {

      let state =  this.state

      let propSet ;
      if(state.filters.facets) propSet = state.filters.facets[prop]
      if(!propSet) propSet = [ "Any" ]
      else if(propSet.val) propSet = propSet.val

      if(excl || !val) { propSet = propSet.filter(v => lab.indexOf(v) === -1) ; }
      if(val) propSet = propSet.concat(lab);

      if(!propSet.length) propSet = [ "Any" ] ;

      if(lab.indexOf("Any") !== -1) {
         if(val) propSet = [ "Any" ]
      }
      else {
         if(propSet.indexOf("Any") !== -1) propSet = propSet.filter(v => v !== "Any")
         if(!propSet.length) propSet = [ "Any" ] ;
      }
      
      if(!state.filters.exclude) state.filters.exclude = {}
      let exclude = state.filters.exclude ;
      if(!excl) {
         if(val) { 
            if(exclude[prop]) propSet = propSet.filter(v => exclude[prop].indexOf(v) === -1)
            exclude[prop] = [] // doesn't make sense both selecting a value and excluding another
         }
         else if(exclude[prop]) { 
            if(lab.indexOf("Any") === -1) exclude[prop] = exclude[prop].filter(v => lab.indexOf(v) === -1)
            else exclude[prop] = []
         }
         //if(!exclude[prop]) delete exclude[prop]
      }
      else if(propSet.indexOf("Any") === -1) { 
         if(!exclude[prop]) exclude[prop] = []
         exclude[prop] = [ ...exclude[prop], ...lab ]         
         if(excl && exclude[prop]) propSet = propSet.filter(v => exclude[prop].indexOf(v) !== -1)
      }

      let facets = state.filters.facets ;
      if(!facets) facets = {}
      if(prop == bdo+"workGenre") {

         facets = { ...facets, [prop] : { alt : [ prop, bdo + "workIsAbout", tmp + "etextAbout" ], val : propSet } }
      }
      else
      {
         facets = { ...facets, [prop] : propSet }
      }

      state = { ...state, paginate:{index:0,pages:[0],n:[0]}, repage: true, filters:{ ...state.filters, facets, exclude }  }      

      if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1 && this.props.searches && this.props.searches[this.state.filters.datatype[0]]) {

         console.log("facets",facets)

         state.filters.preload = true

         let {pathname,search} = this.props.history.location
         this.props.history.push({pathname,search:search.replace(/(&([nf]|pg)=[^&]+)/g,"")+"&pg=1"+getFacetUrl(state.filters,this.props.config.facets[state.filters.datatype[0]])})
      }

      this.setState(state);

      console.log("checkF",prop,lab,val,facets,state);



   }

   /*
   handleCheckMulti = (ev:Event,lab:string,val:boolean,params?:{},force?:boolean) => {

      console.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)

      let types = searchTypes.slice(1) //[ "Person","Work","Corporation","Place","Etext", "Role","Topic","Lineage"]
      if(this.state.results && this.state.results[this.state.id] && this.state.results[this.state.id].types) types = this.state.results[this.state.id].types

      let f = [lab]

      let prevDT = [ ...this.state.filters.datatype ]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {  datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }
     
      if(val)
      {
        
         if(lab === "Any") state = { ...state, filters:{ ...state.filters, datatype:["Any"] }}
         else {
            let dt = [ ...this.state.filters.datatype ]
            if(dt.indexOf(lab) === -1 && dt.indexOf("Any") === -1) dt.push(lab);

            if(types.filter(i => !dt.includes(i)).length == 0) { dt = [ "Any" ] }

            if(force) dt = [lab]
            else prevDT = null

            console.log("dt:!:",dt,force,JSON.stringify(params,null,3))

            state = { ...state, filters:{ ...state.filters, datatype: dt, prevDT }}
         }

         if(["Any","Person","Work","Etext"].indexOf(lab) !== -1)
         {
            this.requestSearch(this.props.keyword,[lab])
            //state = { ...state, filters:{ ...state.filters, datatype: [lab] }}
         }
      }
      else if(!val)
      {           
         if(lab === "Any") state = { ...state, filters:{ ...state.filters, datatype:[] }}
         else {
            let dt = [ ...this.state.filters.datatype ]
            let i
            if(i = dt.indexOf("Any") !== -1) { dt = [ ...types ] }
            if((i = dt.indexOf(lab)) !== -1) { delete dt[i] }
            if((i = dt.indexOf("Any")) !== -1) { delete dt[i] }
            dt = dt.filter(e => e)

            console.log("dt::",dt)

            if(prevDT.length <= 1) prevDT = null

            state = { ...state, filters:{ ...state.filters, datatype: dt, prevDT }}

            if(dt.length === 1) this.requestSearch(this.props.keyword,[dt[0]]);
         }
      }

      this.setState(state)
      console.log("state::",JSON.stringify(state.collapse,null,3))

   }
   */

   handleCheck = (ev:Event,lab:string,val:boolean,params?:{},force?:boolean) => {

      console.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)

      let types = searchTypes //.slice(1) //[ "Person","Work","Corporation","Place","Etext", "Role","Topic","Lineage"]
      if(this.state.results && this.state.results[this.state.id] && this.state.results[this.state.id].types) types = this.state.results[this.state.id].types

      let f = [lab]

      let prevDT = [ ...this.state.filters.datatype ]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {  datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }
     
      if(val)
      {
         prevDT = null

         state = { ...state, filters:{ ...state.filters, datatype:[ lab ], prevDT }}

         if(state.sortBy) delete state.sortBy
         
         if([ /*"Any",*/ "Person","Place","Work","Etext","Role","Topic","Corporation","Lineage"].indexOf(lab) !== -1)
         {
            this.requestSearch(this.props.keyword,[ lab ], this.props.language, true);
         }
         
      }
      /*
      else if(!val)
      {            
         prevDT = null

         state = { ...state, filters:{ ...state.filters, datatype:[ "Any" ], prevDT }}
         
         this.requestSearch(this.props.keyword,["Any"]);
         
      }
      */

      this.setState(state)
      console.log("state::",JSON.stringify(state.collapse,null,3))

   }
/*
handleCheck = (ev:Event,lab:string,val:boolean,params:{}) => {

      console.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)


      let f = [lab]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {   datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }

      if(val && this.props.keyword)
      {

         if(this.props.language != "")
         {
            console.log("here?",lab)

            if(["Any","Person","Work","Etext"].indexOf(lab) !== -1)
            {
               this.requestSearch(this.props.keyword,lab)
            }
            else  {

               this.props.history.push("/search?q="+this.props.keyword+"&lg="+this.getLanguage()+"&t="+lab);
            }
         }
         else {


               this.props.history.push("/search?r="+this.props.keyword+"&t="+lab);

         }


      }

      this.setState(state)

   }
*/


   login() {
      this.props.auth.login(this.props.history.location);
   }

   logout() {
      this.props.auth.logout(this.props.history.location);
   }

   handleLanguage = event => {

      console.log("handleL",event.target,event.key,event.target.value)

      if(!event.key && event.target.value!== undefined)
      {
         let s = { ...this.state, [event.target.name]: event.target.value, langOpen:false }
         if(this.props.keyword) s = { ...s } //, willSearch:true }

         console.log("s!!!",s)

         this.setState( s );
      }
      else {

         console.log("...",event,event.target.name,this._customLang.value)

         let s = { ...this.state,
               langOpen:true }

         if (event.key === 'Enter')
         {
            let customLang = this.state.customLang
            if(!customLang) customLang = []
            if(this._customLang.value && customLang.indexOf(this._customLang.value) === -1 && langSelect.indexOf(this._customLang.value) === -1)
               customLang.push(this._customLang.value)

            s = { ...s, [event.target.name]: this._customLang.value, langOpen:false, customLang }

            console.log("s",s)

         }
         else if(!event.target.name) {
            s = { ...s, langOpen:false }

         }


         this.setState( s );

      }
  };

   /*
     handleCustomLanguage(e)
     {
         console.log("handleCL",e)

         //this.setState({...this.state,customLang:this._customLang.value})
     }

     handleCustomLanguageKey(e)
     {
        console.log("handleCLK",e)

        if (e.key === 'Enter')
        {

            console.log("enter")
           //this.handleLanguage(e,this._customLang.value)

           this._customLang.value = "" ;
        }
     }
*/

   pretty(str:string)
   {
     for(let p of prefixes) { str = str.replace(new RegExp(p,"g"),"") }

     str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

     return str ;
   }

   fullname(prop:string,preflabs:[],useUIlang:boolean=false)
   {

      if(this.props.dictionary && this.props.dictionary[prop] && this.props.dictionary[prop][rdfs+"label"])
      {
         preflabs = []
         if(this.props.dictionary[prop][rdfs+"label"]) preflabs = [ ...preflabs, ...this.props.dictionary[prop][rdfs+"label"] ]
         if(this.props.dictionary[prop][skos+"prefLabel"]) preflabs = [ ...preflabs, ...this.props.dictionary[prop][skos+"prefLabel"] ]
      }

      if(preflabs)
      {
         if(!Array.isArray(preflabs)) preflabs = [ preflabs ]

         //console.log("fullN",prop,preflabs,this.props.locale,this.props.prefLang,typeof preflabs[0])

         let lang = "lang";
         let val = "value";
         if(preflabs.length > 0 && preflabs[0]["@language"]) { lang = "@language" ; val = "@value"; }
         if(preflabs.length > 0 && preflabs[0]["xml:lang"]) { lang = "xml:lang" ; val = "value"; }

         let label = getLangLabel(this,prop,preflabs,false,useUIlang)

         //console.log("full",prop,label,preflabs,useUIlang)

         /*
         let label = preflabs.filter(e => e[lang] == this.props.locale )
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == this.props.prefLang)
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "en")
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "bo-x-ewts")
         */
         if(label) return label[val]
         //return preflabs[0][value]
      }

      return this.pretty(prop)
   }


   counTree(tree:{},meta:{},any:integer=0,tag:string):[]
   {
      //console.log("cT",tree,meta,any)
      let ret = [], idx = 0
      let tmp = Object.keys(tree).map(k => ({[k]:tree[k]}))
      let index = {}
      //console.log("tmp",tmp)
      while(tmp.length > 0) {
         let t = tmp[0]

         let kZ = Object.keys(t)
         let kZsub = Object.keys(t[kZ[0]])

         let labels = this.props.dictionary[kZ[0]]
         if(labels && labels[rdfs+"label"]) labels = labels[rdfs+"label"]
         else if(labels && labels[skos+"prefLabel"]) labels = labels[skos+"prefLabel"]
         if(!labels) labels = []

         //console.log("t",t,kZ,kZsub,labels)

         tmp = tmp.concat(kZsub.map(k => ({[k]:t[kZ[0]][k]})))

         //console.log("tmp",tmp)

         let cpt,checkSub ;         
         if(meta[kZ[0]] && meta[kZ[0]].n) 
            cpt = meta[kZ[0]].n
         else {
            cpt = kZsub.reduce((acc,e) => { return acc + (meta[e]&&meta[e].n?meta[e].n:0) ; },0)
            if(any && cpt > any) cpt = any ;
            checkSub = true ;
         }

         let cpt_i ;
         if(tag && this.props.metadata && this.props.metadata[tag]) {

            cpt_i = this.subcount(tag,kZ[0])         
            /*
            kZsub.reduce((acc,e) => { return acc + (meta[e]&&meta[e].i?meta[e].i:0) ; },0)
            if(cpt && cpt_i > cpt) cpt_i = cpt ;
            cpt_i = cpt_i + " / "
            */
         }
         

         //console.log("cpt",cpt)

         var elem = {"@id":kZ[0],"taxHasSubClass":kZsub,["tmp:count"]:cpt,"skos:prefLabel":labels}
         if(cpt_i !== "") elem["tmp:subCount"] = cpt_i ;
         if(checkSub) elem = { ...elem, checkSub}
         ret.push(elem)
         index[kZ[0]] = idx + 2
         idx ++

         delete tmp[0]
         tmp = tmp.filter(e=> e != null);

         //console.log("tmp",tmp,ret)
         //break;
      }

      ret = [
               {"@id":"root", "taxHasSubClass":["Any"].concat(Object.keys(tree))},
               {"@id":"Any",["tmp:count"]:any,"taxHasSubClass":[]}
           ].concat(ret)

      //console.log("index",index)

      if(tag && this.props.metadata && this.props.metadata[tag]) {
         let any_i = 0
         for(let e of ret[0]["taxHasSubClass"]) {
            if(e !== "Any") {
               let root = ret[index[e]]
               /*
               //console.log("root",root)
               root["tmp:subCount"] = 0
               for(let f of root["taxHasSubClass"]) {
                  let i = ret[index[f]]["tmp:subCount"] 
                  if(i) root["tmp:subCount"] += Number(i.replace(/[^0-9]/g,""))
               }
               */
               if(root["tmp:subCount"]) any_i += Number(root["tmp:subCount"].replace(/[^0-9]/g,""))
               root["tmp:subCount"] = root["tmp:subCount"] //+ " / "
            }
         }
         ret[1]["tmp:subCount"] = any_i + " / "
      }

      return ret;
   }

   prevPage(id)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      console.log("state",state)   
      if(state && state.index > 0) {          
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:state.index - 1}
         }) 

         let {pathname,search} = this.props.history.location
         this.props.history.push({pathname,search:search.replace(/(&(n|pg)=[^&]+)/g,"")+"&pg="+(state.index - 1 + 1)+"&n="+(state.n[state.index - 1]+1)})
      }
   }

   goPage(id,i)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      console.log("state",state)   
      if(state && i > 0) { 
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:i-1}
         }) 

         let {pathname,search} = this.props.history.location
         this.props.history.push({pathname,search:search.replace(/(&(n|pg)=[^&]+)/g,"")+"&pg="+(i)+"&n="+(state.n[i-1]+1)})
      }
   }

   nextPage(id)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      if(state && state.index < state.pages.length - 1) { 
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:state.index + 1}
         }) 

         let {pathname,search} = this.props.history.location
         this.props.history.push({pathname,search:search.replace(/(&(n|pg)=[^&]+)/g,"")+"&pg="+(state.index + 1 + 1)+"&n="+(state.n[state.index + 1]+1)})
      }
   }

   inserTree(k:string,p:{},tree:{}):boolean
   {
      //console.log("ins",k,p,tree);

      for(let t of Object.keys(tree))
      {
         //console.log(" t",t)

         if(p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(e => e.value == t).length > 0
         || p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(e => e.value == t).length > 0
         || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(e => e.value == t).length > 0 )
         {
            //console.log("  k",k)
            tree[t] = { ...tree[t], [k]:{} }
            return true
         }
         else if(this.inserTree(k,p,tree[t])) return true ;
      }

      return false ;
   }

   handleOpenSourceMenu(event,src) {
      this.setState({ ...this.state,
         anchor:{...this.state.anchor,[src]:event.currentTarget},
         collapse:{...this.state.collapse,[src]:true}
      })
   }

   handleCloseSourceMenu(event,src) {
      this.setState({ ...this.state,
         anchor:{...this.state.anchor,[src]:null},
         collapse:{...this.state.collapse,[src]:false}
      })
   }


   getEtextLink(id,n,allProps:[]=[]) {

      // TODO activate links

      if(allProps.filter(e => e.type === bdo+"chunkContents" || e.type === tmp+"nbChunks").length)
         return <div class="match">
            <span class="instance-link">&gt;&nbsp;
               <span class="urilink" /*onClick={(e) => this.props.onGetInstances(shortUri(id))}*/ >See context</span>
               <emph> or </emph>
               <span class="urilink" >Open Etext</span>
            </span>
            </div>
   }

   getEtextChunks(id,n,allProps:[]=[]) {
      let chunks= allProps.filter(p => p.type === bdo+"eTextHasChunk")
      if(chunks.length) {

      }
   }

   getInstanceLink(id,n,allProps:[]=[]) {
      let nb = allProps.filter(p => p.type === tmp+"nbInstance")
      if(nb.length) {
         nb = Number(nb[0].value)
         if(nb) {
            let instances = this.props.instances
            if(instances) instances = instances[fullUri(id)]

            let iUrl = "/search?i="+shortUri(id)+"&t=Work&w="+ encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"").replace(/(&n=[^&]*)/g,"")+"&n="+n) //"/search?q="+this.props.keyword+"&lg="+this.props.language+"&t=Work&s="+this.props.sortBy+"&i="+shortUri(id)

            console.log("inst",instances)

            if(instances) { 
               let instK = Object.keys(instances), n = 1, ret = [], seeAll 

               for(let k of instK) {
                  let label = getLangLabel(this,"",instances[k].filter(e => e.type === skos+"prefLabel"))
                  
                  if(!label) label = { value:"?","xml:lang":"?"}
                  // TODO etext instance ?

                  ret.push(<div>{this.makeResult(k,n,null,label.value,label["xml:lang"],null,null,null,[],null,instances[k],label.value,true)}</div>)
                  n++
                  if(n>3) { 
                     seeAll = true
                     break ;
                  }
               }
               if(ret.length) { 

                  ret = <Collapse in={!this.state.collapse[id]}>
                     {ret}
                  </Collapse>

                  ret = [ 
                     <span class="instance-collapse" onClick={(e) => { 
                        this.setState({...this.state,collapse:{...this.state.collapse,[id]:!this.state.collapse[id] },repage:true })
                      }}>{!this.state.collapse[id]?<ExpandMore/>:<ExpandLess/>}</span>,
                     <span class="label">{"Has Instances"+(ret.length > 1 ?"s":"")}:&nbsp;</span>, 
                     <div style={{clear:"both"}}></div>,
                     ret
                  ]

                  if(seeAll) ret.push(<span class="instance-link">&gt;&nbsp;<Link class="urilink" to={iUrl}>Browse All Instances ({nb})</Link></span>)

                  return ret
               }
            }
            else
               return <div class="match">
                  <span class="instance-link">&gt;&nbsp;
                     <span class="urilink" onClick={(e) => this.props.onGetInstances(shortUri(id))}>Preview Instances</span>
                     <emph> or </emph>
                     <Link class="urilink" to={iUrl}>Browse All ({nb})</Link>
                  </span>
                </div>
         }
      }
   }

   getResultProp(prop:string,allProps:[],plural:string="s", doLink:boolean = true, fromProp:[], exclude:string,useAux:[],findProp:[],altInfo:[],iri) {

      if(plural === true) plural = "s"

      if(allProps && this.props.assoRes) { 
         if(!fromProp) fromProp = [ prop ]
         let ret = []
         let id ;
         if(!useAux) id = allProps.filter( e => fromProp.includes(e.type) && (!exclude || exclude !== e.value) )
         else if(findProp) id = allProps.filter(e => useAux.includes(e.type)).map(e => this.props.assoRes[e.value]).filter(e=>e).reduce( (acc,e) =>{
            let t = e.filter(f => f.type === rdf+"type")
            if(t.length) return { ...acc, [t[0].value]:e}
            else return acc
         },{}) 
         
         //console.log("labels/prop",prop,id) //,useAux,fromProp,allProps) //,this.props.assoRes)         

         if(useAux && !findProp) { // etext

            id = allProps.filter(e => fromProp.includes(e.type)).map(e => [{"@id":e.value}, ...this.props.assoRes[e.value].map(f => !e.expand||!e.expand.value||f.type !== bdo+"chunkContents"?f:{...e, ...f /*,expand:e.expand*/}) ]) //.reduce( (acc,e) => ([ ...acc, ...this.props.assoRes[e.value] ]),[]) 

            //console.log("uA1",id,allProps,fromProp,useAux,findProp)

            let val,lang,cpt = 1

            for(let i of id) {
               let labels = getLangLabel(this,prop,i.filter(e => useAux.includes(e.type)))

               lang = labels["xml:lang"]
               if(!lang) lang = labels["lang"]
               if(!lang) lang = labels["@language"]
               val = labels.value
               if(!val) val = labels["@value"]

               let startChar = labels.startChar, endChar = labels.endChar
               
               let expand = labels.expand
               if(expand && expand.value) expand = getLangLabel(this,prop,[ expand ])
               let context = labels.context
               if(context && context.value) context = getLangLabel(this,prop,[ context ])

               let inPart = labels.inPart

               //console.log("expand",expand)

               let info = ""
               if(altInfo) {
                  for(let f of altInfo) {
                     f = i.filter(e => e.type === f)
                     if(f[0] && f[0].value) info += " / " + f[0].value
                  }
               }
               
               /*
               ret.push(<div class="match" style={{margin:"5px 0 5px 0"}}>
                  <span>{highlight(val)}{
                     lang && <Tooltip placement="bottom-end" title={
                                       <div style={{margin:"10px"}}>
                                          <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                       </div>
                                    }><span className="lang">&nbsp;{lang}</span></Tooltip>
                           }{info}
                  </span>
               </div>)
               */
               
               ret.push(<div>{this.makeResult(iri /*i[0]["@id"]*/,cpt,null,"@"+startChar+"~"+endChar,"",null,null,null,
                  [{lang,value:val,type:tmp+"textMatch",expand,context,startChar,endChar,inPart} ], //...i.filter(e => [bdo+"sliceStartChar",tmp+"matchScore"].includes(e.type) )],
                  null,[],null,true)}</div>)

               cpt++
            }

            if(ret.length) return ([
                        <span class="instance-collapse" onClick={(e) => { 
                           this.setState({...this.state,collapse:{...this.state.collapse,[iri]:!this.state.collapse[iri] },repage:true })
                        }}>{!this.state.collapse[iri]?<ExpandMore/>:<ExpandLess/>}</span>,
                        <span class="label">{this.fullname(prop,[],true)+(plural && ret.length > 1 ?plural:"")}:&nbsp;</span>,
                        <div style={{clear:"both"}}></div>,
                        <Collapse in={this.state.collapse[iri]} >
                           {ret}
                        </Collapse>
                     ])
         }
         else if(useAux && findProp) {
            
            //console.log("uA2",id,useAux,findProp)
            
            for(let p of findProp) {
               
               if(id[p]) {
 
                  let val = id[p].filter(e => e.type === bdo+"onYear")
                  if(val.length) val = <span>{val[0].value}</span>
                  else {
                     let bef = id[p].filter(e => e.type === bdo+"notBefore")
                     let aft = id[p].filter(e => e.type === bdo+"notAfter")
                     if(bef.length && aft.length) val = <span>{bef[0].value+" ~ " +aft[0].value}</span>
                  }

                  ret.push(<div class="match">
                     <span class="label">{this.fullname(p,[],true)}:&nbsp;</span>
                     <div class="multi">{val}</div>
                  </div>)

               }
            }
            return ret
         }
         else if(!doLink) {
            let langs = extendedPresets(this.state.langPreset)
            let labels = sortLangScriptLabels(id,langs.flat,langs.translit)
            for(let i of labels) {
               let val = i["value"]
               if(val === exclude) continue
               if(val && val.startsWith("http")) val = this.fullname(val)
               else val = highlight(val)
               let lang = i["xml:lang"]
               if(!lang) lang = i["lang"]
               ret.push(<span>{val}{
                  lang && <Tooltip placement="bottom-end" title={
                                    <div style={{margin:"10px"}}>
                                       <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                    </div>
                                 }><span className="lang">&nbsp;{lang}</span></Tooltip>
                        }</span>)
            }
         }
         else if(id && id.length) { 

            let sortId = []

            for (let i of id) {

               // TODO presort values using language preferences

               let _i = i
               i = fullUri(i.value)
               let uri = shortUri(i), val = uri, lang

               let labels = this.props.assoRes[i]
               if(!labels && this.props.dictionary) { 
                  labels = this.props.dictionary[_i.value]
                  if(labels) {
                     if(labels[skos+"prefLabel"]) labels = labels[skos+"prefLabel"]
                     else labels = labels["http://www.w3.org/2000/01/rdf-schema#label"]
                  }
               }

               //console.log("labels1",i,prop) //,labels,this.props.assoRes)

               if(labels) { 
                  labels = getLangLabel(this,prop,labels)
                  if(labels) {
                     lang = labels["xml:lang"]
                     if(!lang) lang = labels["lang"]
                     if(!lang) lang = labels["@language"]
                     val = labels.value
                     if(!val) val = labels["@value"]
                  }
                  //console.log("labels2",labels)                        
               }

               sortId.push({ value: val, lang, uri, _i})
            }

            let langs = extendedPresets(this.state.langPreset)
            sortId = sortLangScriptLabels(sortId,langs.flat,langs.translit)

            for (let i of sortId) {

               if(i.value != "false") 
                  ret.push(<span><Link to={"/show/"+i.uri}>{i.value}</Link>{
                     i.lang && <Tooltip placement="bottom-end" title={
                                       <div style={{margin:"10px"}}>
                                          <Translate value={languages[i.lang]?languages[i.lang].replace(/search/,"tip"):i.lang}/>
                                       </div>
                                    }><span className="lang">&nbsp;{i.lang}</span></Tooltip>
                           }</span>)
            }            
         }
         if(ret.length && !useAux) return <div class="match">
                  <span class="label">{this.fullname(prop,[],true)+(plural && ret.length > 1 ?plural:"")}:&nbsp;</span>
                  <div class="multi">{ret}</div>
                </div>
      }
   }

   makeResult(id,n,t,lit,lang,tip,Tag,url,rmatch = [],facet,allProps = [],preLit,isInstance)
   {
      //console.log("res",id,allProps,n,t,lit,lang,tip,Tag,rmatch,sameAsRes)

      let sameAsRes ;
      if(allProps) sameAsRes = [ ...allProps ]
      if(!id.match(/[:/]/)) id = "bdr:" + id

      let litLang = lang
      let savLit = "" + lit

      let prettId = id, fullId = id ;      
      for(let k of Object.keys(prefixesMap)) {
         prettId = prettId.replace(new RegExp(prefixesMap[k]),k+":")  
         fullId = fullId.replace(new RegExp(k+":"),prefixesMap[k])
      }
      prettId = prettId.replace(/[/]$/,"");

      if(!lit) lit = prettId

      //console.log("id",id,prettId)

      let status = "",warnStatus,warnLabel

      if(this.props.auth.isAuthenticated())
      {
         if(allProps) status = allProps.filter(k => k.type === adm+"status" || k.type === tmp+"status")
         if(status && status.length) status = status[0].value
         else status = null
         
         //if(status) warnLabel = getOntoLabel(this.props.dictionary,this.props.locale,status)
         if(!warnLabel && status)  warnLabel = status.replace(/^.*[/]([^/]+)$/,"$1")

         if(status && !status.match(/Released/)) warnStatus = <ErrorIcon/>
         if(status && status.match(/Withdra/)) warnStatus = <WarnIcon/>

         if(warnStatus) warnStatus = <Tooltip key={"tip"} placement="bottom-end" title={<div style={{margin:"10px"}}>{warnLabel}</div>}>{warnStatus}</Tooltip>

         if(status) status = status.replace(/^.*[/]([^/]+)$/,"$1")
         else status = ""
      }


      let ret = (
            <div key={t+"_"+n+"_"}  className={"contenu" }>
                  <ListItem style={{paddingLeft:"0",display:"flex",alignItems:"center"}}>
                     <div style={{width:"30px",textAlign:"right",color:"black",fontSize:"0.9rem",marginLeft:"16px",flexShrink:0}}>{warnStatus}{n}</div>
                     {/* <ListItemText style={{height:"auto",flexGrow:10,flexShrink:10}}
                        primary={ */}
                           <div>
                              <h3 key="lit">
                                 {lit}
                                 { lang && <Tooltip key={"tip"} placement="bottom-end" title={
                                          <div style={{margin:"10px"}}>
                                             <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                          </div>
                                       }>
                                          <span className="lang">&nbsp;{lang}</span>
                                       </Tooltip> }
                              </h3>
                        {/*   </div>
                         }
                        //secondary={id}
                        secondary={
                           <div> */}
                              {/* <p key="id">
                                 {prettId}
                                 { Tag && <Tooltip key={"tip"} placement="bottom-start" title={
                                          <div style={{margin:"10px"}}>
                                             {tip}
                                          </div>
                                       }>
                                          <Tag style={{height:"18px",verticalAlign:"-4px",marginLeft:"5px"}}/>
                                       </Tooltip>}
                              </p> */}
                           </div>
                        {/* }
                     ></ListItemText> */}
                     {/* { Tag && <ListItemIcon><Tag/></ListItemIcon> } */}
                  </ListItem>
            </div> )

         let retList
         

         let bestM = allProps.filter(e => e.type === tmp+"bestMatch")
         if(!bestM.length) bestM = rmatch.filter(e => e.type === tmp+"textMatch")
         let startC, endC 

         //console.log("bestM",bestM)

         if(bestM.length) { 
            endC = bestM[0].endChar
            bestM = "?startChar="+(startC = bestM[0].startChar) /*+"-"+bestM[0].endChar*/ +"&keyword="+this.props.keyword+"@"+this.props.language
         }
         else bestM = ""

         let prefix = prettId.replace(/:.*$/,"")
         
         let directSameAs = false
         if(!prettId.match(/^bdr:/) && (fullId.match(new RegExp(cbcp+"|"+cbct+"|"+rkts)) || !sameAsRes || !sameAsRes.filter(s => s.value.match(/[#/]sameAs/) || (s.type.match(/[#/]sameAs/) && (s.value.indexOf(".bdrc.io") !== -1 || s.value.indexOf("bdr:") !== -1))).length))   {
            let u 
            if((u = sameAsRes.filter(s => s.type === adm+"canonicalHtml")).length) u = u[0].value
            else u = fullId

            retList = [ ( <a target="_blank" href={u} className="result">{ret}</a> ) ]                  

            if(!this.props.language && !fullId.match(new RegExp(cbcp+"|"+cbct+"|"+rkts)) && fullId.match(new RegExp(bdr))) rmatch = [ { type:tmp+"sameAsBDRC", value:prettId,  lit } ]

            directSameAs = true
         }
         else if(prettId.match(/^([^:])+:/))
            retList = [ ( <Link key={n} to={"/show/"+prettId+bestM} className="result">{ret}</Link> ) ]
         else
            retList = [ ( <Link key={n} to={url?url.replace(/^https?:/,""):id.replace(/^https?:/,"")} target="_blank" className="result">{ret}</Link> ) ]
         

         let dico
         if(!sameAsRes) sameAsRes = []        

         if(rmatch.filter(e => e.type === owl+"sameAs")) sameAsRes.push({type:owl+"sameAs",value:id});

         if(!sameAsRes.length) sameAsRes = sameAsRes.concat(rmatch.filter(e => e.value === owl+"sameAs")).map(e => ({ "type":owl+"sameAs", "value":this.props.keyword}))
         else {
            dico = sameAsRes.filter(p => p["lang"]!== undefined || p["xml:lang"]!== undefined || p["@language"]!== undefined).reduce( (acc,e) => {
               let id = acc[e.type]
               if(!id) id= []
               id.push(e);
               return ({...acc,[e.type]:id})
            },{}) 
            
            rmatch = rmatch.concat(sameAsRes.filter(p => p.type === owl+"sameAs")) // || p.type.match(/sameAsMBBT$/)))
            sameAsRes = sameAsRes.filter(p => (p.type === owl+"sameAs" || p.type === adm+"canonicalHtml")) // || p.type.match(/sameAsMBBT$/))
            //console.log("dico",dico)
         }

         if(sameAsRes.length) {
            //console.log("sameAs",prettId,id,dico,rmatch,sameAsRes)
         
            let menus = {}
            let sources = []
            let hasRes = {}
            let img = { 
               //"bdr":  "/logo.svg", 
               "dila": "/DILA-favicon.ico", 
               "mbbt": "/MB-icon.jpg",
               "ola":  "/OL.png",  //"https://openlibrary.org/static/images/openlibrary-logo-tighter.svg" //"https://seeklogo.com/images/O/open-library-logo-0AB99DA900-seeklogo.com.png", 
               "viaf": "/VIAF.png",
               "wd":   "/WD.svg",
               "rkts": "/RKTS.png",
               "eftr": "/84000.svg",
               "cbct": false,
               "cbcp": false,
            } 

            const providers = { 
               "ia":"Internet Archive",                 
               "mbbt":"Marcus Bingenheimer",
               "wd":"Wikidata",
               "ola":"Open Library",
               "eftr":"84000",
               "cbcp": "CBC@",
               "cbct": "CBC@"
            }

            for(let res of sameAsRes.filter(r => r.type.match(/[#/]sameAs[^/]*$/))) 
               for(let src of Object.keys(img)) {
                  if(res.value.match(new RegExp("(^"+src+":)|(^"+prefixesMap[src]+")"))) { 
                     if(!hasRes[src]) hasRes[src] = [ res.value ] //.replace(new RegExp(prefixesMap[src]),src+":")                  
                     else hasRes[src].push(res.value)
                  }  
               }

            for(let src of Object.keys(img)) 
               if(!hasRes[src] && prettId.match(new RegExp("(^"+src+":)|(^"+prefixesMap[src]+")"))) 
                  if(!hasRes[src]) hasRes[src] = [ prettId ]
                  else  hasRes[src].push(prettId)

            for(let src of Object.keys(img)) 
               if(hasRes[src]) for(let h in hasRes[src]) {             
                  
                  let hres = hasRes[src][h]

                  let shortU = shortUri(hres)
                  if(src === "rkts" || src == "cbct" || src == "cbcp") shortU = prettId
                  //let shortU = hasRes[src]

                  let prefix = shortU.replace(/:.*$/,"");

                  let url = fullUri(hres)

                  if(url.match(new RegExp("^("+src+":)|("+prefixesMap[src]+")"))) {                     
                     let canonUrl = sameAsRes.filter(p => p.type === adm+"canonicalHtml")                     
                     if(canonUrl.length && canonUrl[0].value && canonUrl[0].value.indexOf(prefix) !== -1) url = canonUrl[0].value
                     //console.log("cUrl1",url,prefix,hres)
                  }

                  if(this.props.assoRes && this.props.assoRes[url]) {
                     let canonUrl = this.props.assoRes[url]
                     if(canonUrl && canonUrl.filter) canonUrl = canonUrl.filter(p => p.type === adm+"canonicalHtml" || p.fromKey === adm+"canonicalHtml")
                     if(canonUrl.length && canonUrl[0].value && canonUrl[0].value.indexOf(prefix) !== -1) url = canonUrl[0].value
                     //console.log("cUrl2",url,prefix,hres)
                  }

                  let prov = src.toUpperCase()
                  if(providers[src]) prov = providers[src]

                  let image = <div class="sameAsLogo"><div>{prov}</div></div>
                  if(img[src]) image = <img src={img[src]}/>

                  if(h == 0) sources.push(
                     <div class="source-data" id={src}>
                        {/*!directSameAs &&
                        <Link onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} to={"/show/"+shortU}>
                           {image}
                        </Link> }
                        {directSameAs &&
                        <a onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} href={url} target="_blank">
                           {image}
                        </a> */}                        
                        <a onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} href={url} target="_blank">
                           {image}
                        </a>
                        {src !== "bdr" && <span onMouseEnter={(ev) => this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId)}></span> }
                     </div>
                  )

                  
                  
                  let menuId = "menu-"+src+"-"+prettId

                  //console.log("menuId",menuId,menus[menuId])

                  if(!menus[menuId]) menus[menuId] = { full: [ url ], short:shortU, src:prov }
                  else if(menus[menuId].full.indexOf(url) === -1) {
                     menus[menuId] = { ...menus[menuId], full:[ ...menus[menuId].full, url ] }
                  }

               }
                     /*
                     <Tooltip placement="bottom-end" title={<div style={{margin:"10px"}}>Show data from {sameAsMap[src]?sameAsMap[src]:src.toUpperCase()}</div>}>
                        <Link to={"/show/"+hasRes[src]}><img src={img[src]}/>
                     </Link></Tooltip>
                     */
               
            if(sources.length > 1 || sources.length == 1 && !hasRes["bdr"] ) { 
               retList.push(<div class="source">{sources}</div>)
               retList = [ <div class="result-box">{retList}</div> ]
               this._menus = { ...this._menus, ...menus } 
            }
            
         }

         let lastP,prop = ""

         let nbChunks = allProps.filter(e => e.type === tmp+"nbChunks")
         if(nbChunks[0] && nbChunks[0].value) nbChunks = Number(nbChunks[0].value)
         else nbChunks = "?"

         retList.push( <div id='matches'>         
            { this.getResultProp(tmp+"inInstance",allProps) }
            { this.getResultProp(tmp+"inInstancePart",allProps) }
            {
               rmatch.filter(m => m.type !== tmp+"nameMatch").map((m) => {

                  //console.log("m",m,allProps)

                  { 
                     let expand,context,inPart
                     let uri,from
                     if(prop) lastP = prop 
                     prop = this.fullname(m.type.replace(/.*altLabelMatch/,skos+"altLabel"),[],true)
                     let val,isArray = false ;
                     let lang = m["lang"]
                     if(!lang) lang = m["xml:lang"]
                     if(Array.isArray(m.value)) 
                     { 
                        val = m.value.map((e)=> {
                           let lab =  getLangLabel(this,m.type,allProps.filter(l => l.type === e))
                           if(!lab) return this.pretty(e)
                           else {
                              let lang = lab.lang
                              if(!lang) lang = lab["xml:lang"]
                              if(!lang) lang = lab["@language"]
                              return { url:e, label:lab.value, lang} 
                           }
                        })
                        isArray = true 
                     }
                     else {
                        //val = highlight(this.pretty(m.value),k)
                        let mLit = getLangLabel(this,"",[m])

                        // TODO use .context instead of .expand 

                        /*
                        if(this.state.collapse[prettId+"@"+startC]) { 
                           if(m.context && m.context.value) expand = m.context
                           else if(expand && expand.value) expand = m.expand
                           
                           if(expand) expand = getLangLabel(this,"",[{...m, "value":expand.value}])
                        }
                        else expand = true
                        */

                        expand = m.expand
                        if(expand && expand.value) {
                           if(!this.state.collapse[prettId+"@"+startC]) expand = getLangLabel(this,m.type,[{...m, "value":expand.value}])
                           else expand = true
                        }

                        context = m.context
                        if(context && context.value) {
                           if(this.state.collapse[prettId+"@"+startC]) context = getLangLabel(this,m.type,[{...m, "value":context.value}])
                           else context = false
                        }
                        else context = false
                        
                        inPart = m.inPart

                        val = highlight(mLit["value"], facet, context?context:expand, context)
                        //val =  mLit["value"]
                        lang = mLit["lang"]
                        if(!lang) lang = mLit["xml:lang"]
                     }

                     //console.log("val",val,val.length,lang)

                     if(m.type === tmp +"sameAsBDRC") {
                        if(m.value === fullId || m.value == prettId) return ;
                        prop = "Same As BDRC"
                        uri = "/show/"+m.value ;
                        val = m.lit
                        if(litLang) {
                           lang = litLang                              
                        }
                     }
                     else if(m.type.match(/[/#]sameAs/)) {
                        val = m.value;
                        if(val === fullId || val == prettId || shortUri(val) === fullUri(val) ) return ;
                        let label = dico[val]
                        if(!label && this.props.assoRes && this.props.assoRes[val] && this.props.assoRes[val].filter) {

                           //console.log("assoR",this.props.assoRes[val])

                           label = this.props.assoRes[val].filter(v => v['lang'] || v['xml:lang'] || v['@language'] || v['fromKey'] === foaf+"name" )     

                           if(!label.length) label = null
                        }
                        
                        //console.log("val",label,val,lit,lang,dico)

                        if(label && label.length) label = getLangLabel(this,m.type,label)
                        if(label) {
                           uri = val
                           for(let k of Object.keys(prefixesMap)) { 
                              if(uri.startsWith(prefixesMap[k])) prop = "Same As " + (sameAsMap[k]?sameAsMap[k]:k.toUpperCase())
                              uri = uri.replace(new RegExp(prefixesMap[k]),k+":")
                           }
                           uri = "/show/"+uri
                           if(label.value) {
                              val = label.value
                              lang = label.lang
                           }
                           else if(label["@value"]) {
                              val = label["@value"]
                              lang = label["@language"]
                           }
                           if(label["xml:lang"]) lang = label["xml:lang"]                              
                           

                           //console.log("lang",label,lang,uri,val);
                        }
                        else if(val.indexOf(rkts) !== -1) {                           
                           prop = "Same As RKTS"
                           val = [<a class="urilink" href={val}>{shortUri(val)}</a>]
                           if(litLang) {
                              lang = litLang                              
                           }
                        }
                        else if(val.indexOf(wd) !== -1) {                           
                           prop = "Same As WikiData"
                           val = [<a class="urilink" href={val}>{shortUri(val)}</a>]
                           if(litLang) {
                              lang = litLang                              
                           }
                        }
                        else if(val.indexOf(cbct) !== -1 || val.indexOf(cbcp) !== -1) {                           
                           prop = "Same As CBC@"
                           val = [<a class="urilink" href={val}>{shortUri(val)}</a>]
                           if(litLang) {
                              lang = litLang                              
                           }
                        }
                     }
                     else if(m.type.match(/relationType$/) || (m.value && m.value.match && m.value.match(new RegExp("^("+bdr+")?"+this.props.keyword.replace(/bdr:/,"(bdr:)?")+"$")))) {                       
                       
                        uri = this.props.keyword.replace(/bdr:/,"") 
                        val = uri ;
                        lang = null 
                        let label = this.props.resources[this.props.keyword]
                        if(label) label = label[bdr+uri]
                        if(label) label = label[skos+"prefLabel"]
                        if(!label) label = dico[this.props.keyword]
                        if(!label) {
                           label = this.props.resources[this.props.keyword]
                           let fullURI = this.props.keyword
                           for(let k of Object.keys(prefixesMap)) fullURI = fullURI.replace(new RegExp(k+":"),prefixesMap[k])
                           label = label[fullURI]                 
                           if(label && label[skos+"prefLabel"]) label = label[skos+"prefLabel"]
                           else if(label) label = label[foaf+"name"]
                        }
                        if(label) label = getLangLabel(this,m.type,label)
                        if(label) {
                           if(label.value) {
                              val = label.value
                              lang = label.lang
                           }
                           else if(label["@value"]) {
                              val = label["@value"]
                              lang = label["@language"]
                           }
                           if(label["xml:lang"]) lang = label["xml:lang"]                              
                              
                        }

                        //console.log("rTy",uri,val,lang,label)

                        if(m.type.match(/relationType$/))  {
                           
                           if(m.value.match(/sameAs[^/]*$/)) {
                              return ;
                              /* // not needed anymore - already returned by query 
                              uri = this.props.keyword
                              for(let k of Object.keys(prefixesMap)) { 
                                 if(uri.startsWith(k+":")) prop = "Same As " + (sameAsMap[k]?sameAsMap[k]:k.toUpperCase())
                              }
                              uri = "/show/"+uri
                              */
                           } else {

                              prop = this.fullname(m.value,[],true) 
                              uri = "/show/"+this.props.keyword                              
                           }
                        }                        
                     }

                     //console.log("prop",prop,val,m.value,uri)

                     let toggleExpand = (e,id) => {
                        //console.log("toggle",id)
                        this.setState({...this.state,repage:true,collapse:{...this.state.collapse, [id]:!this.state.collapse[id]}})
                     }
                     
                     let getUrilink = (uri,val,lang) => ([ <Link className="urilink" to={"/show/"+shortUri(uri)}>{val}</Link>,lang?<Tooltip placement="bottom-end" title={
                           <div style={{margin:"10px"}}>
                              <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                           </div>
                        }><span className="lang">&nbsp;{lang}</span></Tooltip>:null])

                     if(inPart && inPart.length) {

                        console.log("inPart",inPart)

                        inPart = <div class="inPart">{[ <span>[ from part </span>, inPart.map( (p,i) => { 
                           let label = getPropLabel(this,p,false,true)
                           let ret = [getUrilink(p,label.value,label.lang)]
                           if(i > 0) ret = [ " / ", ret ]
                           return ret 
                        }), " ]" ]}</div>
                     }

                     return (<div className="match">
                        <span className={"label " +(lastP === prop?"invisible":"")}>{(!from?prop:from)}:&nbsp;</span>
                        {!isArray && <span>{expand!==true?null:inPart}{[!uri?val:<Link className="urilink" to={uri}>{val}</Link>,lang?<Tooltip placement="bottom-end" title={
                           <div style={{margin:"10px"}}>
                              <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                           </div>
                        }><span className="lang">&nbsp;{lang}</span></Tooltip>:null]}{expand?<span class="etext-match">&nbsp;(
                           <span class="uri-link" onClick={(e) => { 
                              if(!this.state.collapse[prettId+"@"+startC] && !m.context) this.props.onGetContext(prettId,startC,endC) ; 
                              toggleExpand(e,prettId+"@"+startC); } 
                           }>{expand!==true?"Expand":"Hide"} Context</span>
                           <span> or </span>
                           <Link to={"/show/"+prettId+bestM} class="uri-link">Open Etext</Link>
                           )</span>:null}</span>
                        }
                        {isArray && <div class="multi">
                           {val.map((e)=> {
                              let url = e, label = e, lang = m.lang
                              if(e.url) url = shortUri(e.url)
                              if(e.label) label = e.label
                              if(e.lang) lang = e.lang
                              return (
                                 <span>
                                    <Link to={"/show/"+url}>{m.tmpLabel?m.tmpLabel:label}</Link>
                                    { lang && <Tooltip placement="bottom-end" title={
                                       <div style={{margin:"10px"}}>
                                          <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                       </div>
                                    }><span className="lang">&nbsp;{lang}</span></Tooltip> }
                              
                                 </span> )
                           })}</div>}
                     </div>)
                  }
               })
            }

            { this.getResultProp(tmp+"by",allProps,false,true,[tmp+"author"]) }

            { this.getResultProp(tmp+"nameMatch",allProps,"es",false) } {/* //,true,false) } */}

            {/* { this.getResultProp(tmp+"relationType",allProps) }  */}
            {/* { this.getResultProp(tmp+"InverseRelationType",allProps,true,true,[tmp+"relationTypeInv"]) } */}
            
            {/* { this.getResultProp(tmp+"numberOfMatchingChunks",allProps,true,false,[tmp+"nbChunks"]) } */}
            {/* { this.getResultProp(tmp+"maxScore",allProps,true,false) } */}
            { (nbChunks > 1) && this.getResultProp(tmp+"otherMatches ("+(nbChunks - 1)+")",allProps,false,false,[bdo+"eTextHasChunk"],null,[bdo+"chunkContents"],null,[tmp+"matchScore",bdo+"sliceStartChar"],id) }
            
            { this.getResultProp(tmp+"forWork",allProps) }            
            { this.getResultProp(bdo+"eTextIsVolume",allProps,false,false) }

            {/* { this.getResultProp(bdo+"workIsAbout",allProps,false) } */}
            {/* { this.getResultProp(bdo+"workGenre",allProps) } */}
            { this.getResultProp(bdo+"language",allProps) }

            { this.getResultProp(tmp+"otherLabel",allProps, true, false, [skos+"prefLabel", skos+"altLabel"], !preLit?preLit:preLit.replace(/[↦↤]/g,"") ) }
            {/* { this.getResultProp(tmp+"assetAvailability",allProps,false,false) } */}
            
            { this.getResultProp(rdf+"type",allProps.filter(e => e.type === rdf+"type" && e.value === bdo+"EtextInstance")) } 
            {/* //![bdo+"AbstractWork",bdo+"Work",bdo+"Instance",bdo+"SerialMember",bdo+"Topic"].includes(e.value))) } */}
            { this.getResultProp(tmp+"originalRecord",allProps,false,false, [ tmp+"originalRecord", adm+"originalRecord"]) }
            { this.getResultProp(bdo+"script",allProps) }
            

            { this.getResultProp(bdo+"incipit",allProps,false,false) }
            { this.getResultProp(bdo+"material",allProps) }
            { this.getResultProp(bdo+"printMethod",allProps) }
            { this.getResultProp(bdo+"inRootInstance",allProps) }
            
            { this.state.filters.datatype[0] !== "Person" && 
               this.getResultProp(tmp+"year",allProps,false,false,[tmp+"yearStart"]) }
            { this.state.filters.datatype[0] === "Person" && 
               this.getResultProp(tmp+"year",allProps,false,false,[tmp+"onYear",bdo+"onYear",bdo+"notBefore",bdo+"notAfter"],null,[bdo+"personEvent"],[bdo+"PersonBirth",bdo+"PersonDeath"]) }
            
            { this.getResultProp(tmp+"isCreator",allProps.filter(e => (e.type === tmp+"isCreator" && e.value !== "false")),false,false) }

            { this.getResultProp(bdo+"placeLocatedIn",allProps,false) }
            { this.getResultProp(bdo+"placeType",allProps) }

            { this.getResultProp(bdo+"biblioNote",allProps,false,false,[bdo+"biblioNote",rdfs+"comment"]) }
            { this.getResultProp(bdo+"publisherName",allProps,false,false) }
            { this.getResultProp(bdo+"publisherLocation",allProps,false,false) }
            { this.getResultProp(bdo+"contentLocationStatement",allProps,false,false, [bdo+"instanceExtentStatement",bdo+"contentLocationStatement"]) }

            {/* { this.getResultProp(tmp+"provider",allProps) } */}
            {/* { this.getResultProp(tmp+"popularityScore",allProps,false,false, [tmp+"entityScore"]) } */}
            
            { this.getInstanceLink(id,n,allProps) }

            {/* { this.getEtextLink(id,n,allProps) } */}

            </div> )

      retList.push(<hr/>);

      this._refs[n] = React.createRef();

      retList = <div {... (!isInstance?{id:"result-"+n}:{})} ref={this._refs[n]} className={"result-content " + status}>{retList}</div>



      return retList
   }

   setTypeCounts(types,counts)
   {
      
      let m = 0 ;
      if( this.props.datatypes && this.props.datatypes.metadata) for(let r of Object.keys(this.props.datatypes.metadata) ){

         //r = r.bindings
         let typ = r.replace(/^.*?([^/]+)$/,"$1")
         typ = typ[0].toUpperCase() + typ.slice(1)

         //console.log("typ1",typ)

         if(typ != "" && types.indexOf(typ) === -1)
         {
            m++;

            types.push(typ);

            counts["datatype"][typ]= /*Number(*/ this.props.datatypes.metadata[r] //)
            counts["datatype"]["Any"]+=Number(this.props.datatypes.metadata[r])

         }


         //console.log("counts",counts,types)

      }
      else if(this.state.searchTypes) for(let typ of this.state.searchTypes) {
         
         //console.log("typ2",typ)

         if(typ != "" && types.indexOf(typ) === -1)
         {

            let n ; 
            
            if(this.props.searches[typ] && this.props.searches[typ][this.props.keyword+"@"+this.props.language]) {
               n = this.props.searches[typ][this.props.keyword+"@"+this.props.language].numResults
               if(n) n = Number(n)
            }

            types.push(typ);

            if(n) {
               counts["datatype"][typ]= n
               counts["datatype"]["Any"]+= n
            }

         }

         

      }

      /* // TODO update datatype counts with actual results
      let searchT = Object.keys(this.props.searches)
      for(let k of searchT) {
         if(k.match(/^[A-Za-z]+$/) && !types.includes(k)) {
            types.push(k)
            let n = this.props.searches[k][this.props.keyword+"@"+this.props.language]
            if(n && n.numResults) n = n.numResults
            if(n) {
               counts["datatype"][k]= n
               counts["datatype"]["Any"]+=n
            }

         }
      }
      */

      if(types.length) types = types.sort(function(a,b) { return Number(counts["datatype"][b]) - Number(counts["datatype"][a]) })

      /*
      if(types.length == 2 && !this.state.autocheck)
      {
         this.setState({ ...this.state, autocheck:true })

         console.log("autocheck",types)

         this.handleCheck(null, types[1], true)
      }
      */

      //console.log("types",types,counts)
   }

   handleResOrOnto(message,id)
   {
      //message = []

      // general search or with datatype ?
      let results ;
      if(this.state.results && this.state.results[id] && this.state.results[id].results) results = this.state.results[id].results
      
      //console.log("results?",this.state.filters.datatype,JSON.stringify(results,null,3),this.props.searches[this.props.keyword+"@"+this.props.language])

      // resource search ?
      if(this.props.language == "")
      {
         // ontology property search ?
         if(this.props.ontoSearch == this.props.keyword)
         {
            if(this.props.ontology)
            {

               let iri = this.props.keyword
               let url = this.props.keyword
               for(let k of Object.keys(prefixesMap)) url = url.replace(new RegExp(k+":"),prefixesMap[k])

               let labels = this.props.ontology[url]
               if(!labels && this.props.keyword.match(/^:/))
               {
                  for(let k of Object.keys(this.props.ontology)) {
                     console.log(k.replace(/^.*?[/]([^/]+)$/,":$1"),this.props.keyword)
                     if(k.replace(/^.*?[/]([^/]+)$/,":$1") === this.props.keyword)
                     {
                        labels = this.props.ontology[k]
                        url = k
                        iri = k
                        for(let p of Object.keys(prefixesMap)) iri = iri.replace(new RegExp(prefixesMap[p]),p+":")
                        break ;
                     }
                  }
               }

               console.log("onto lab",labels)

               if(labels)
               {
                  let l = { value : this.props.keyword, lang :"" }
                  if(labels) labels = labels[rdfs+"label"]
                  if(labels) l = labels[0]
                  message.push(<h4 key="keyResource" style={{marginLeft:"16px"}}>Ontology Property Matching (1)</h4>)
                  message.push(this.makeResult(iri,1,null,l.value,l.lang,null,null,"/show/"+iri))
                  //message.push(<iframe id="ontoFrame" className="ontoSearch" src={url} />)
                     /* onLoad={() =>
                     {
                        let iframe = window.parent.document.getElementById("ontoFrame");
                        var container = document.body
                        iframe.style.height = container.offsetHeight + 'px';
                     }} */


               }
               /*
               else {
                  message.push(
                     <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                        No result found.
                     </Typography>
                  )
               }
               */
            }
         }
         
         // resource id matching ? deprecated ? WIP
         else if(this.props.resources &&  this.props.resources[this.props.keyword] )
         {
            let l ; // sublist[o].filter((e) => (e.type && e.type.match(/prefLabelMatch$/)))[0]
            let labels = this.props.resources[this.props.keyword]
            if(labels && labels != true)
            {
               let fullURI = this.props.keyword
               for(let k of Object.keys(prefixesMap)) fullURI = fullURI.replace(new RegExp(k+":"),prefixesMap[k])
               if(labels) labels = labels[fullURI]
               if(labels) {
                  l = getLangLabel(this,"",labels[skos+"prefLabel"]?labels[skos+"prefLabel"]:labels[foaf+"name"])
                  //console.log("l",labels,l)
                  if(l) {
                     let sameAs = this.props.resources[this.props.keyword]
                     if(sameAs) sameAs = sameAs[fullURI]
                     if(sameAs) sameAs = Object.keys(sameAs).filter(k => k === adm+"canonicalHtml" || k === owl+"sameAs").reduce( (acc,k) => ([...acc, ...sameAs[k].map( s => ({ ...s, type:k }))]),[])
                     //console.log("res sameAs", sameAs)
                     if(!this.props.isInstance) {
                        message.push(<h4 key="keyResource">{"Resource Id Matching"}</h4>)
                        message.push(this.makeResult(this.props.keyword,1,null,l.value,l.lang,null,null,null,[],null,sameAs)) //[{"type":owl+"sameAs","value":this.props.keyword}]))
                     }
                  }
               }
            }
         }
      }
      return results ;
   }

   resetDT()
   {
      let datatype = this.state.filters.prevDT
      if(!datatype) datatype  = [ "Any" ]
      this.setState({ ...this.state, filters: { ...this.state.filters, datatype } } ) 
      /*this.handleCheck(e,"Any",true,{},true)*/
   }

   /* // deprecated
   setWorkCateg(categ,paginate) //,categIndex)
   {
      let show  ;
      if(this.state.collapse[categ] == undefined) show = false
      else show = !this.state.collapse[categ]
      
      console.log("setWC",categ,JSON.stringify(paginate,null,3))

      let gotoCateg = paginate.index
      if(show && paginate.pages.length > 1 && paginate.bookmarks && paginate.bookmarks[categ]) { 
         for(let i in paginate.pages) { 
            if(i > 0 && paginate.pages[i-1] <= paginate.bookmarks[categ].i && paginate.bookmarks[categ].i < paginate.pages[i]) { 
               gotoCateg = i-1 ; 
               console.log("catI",gotoCateg);
               break ; 
            }      
         }
      }      

      let params = {  repage:true, paginate:{...paginate, gotoCateg }, collapse:{...this.state.collapse, [categ]:show} }
      
      console.log("categ",categ,paginate,show,JSON.stringify(params,null,3))

      if(this.state.filters.datatype.indexOf("Work") === -1 || this.state.filters.datatype.length > 1) this.handleCheck(null, "Work", true, params, true )
      else this.setState({...this.state, ...params})
   }
   */

   handleResults(types,counts,message,results,paginate,bookmarks) 
   {
      this._menus = {}

      let n = 0, m = 0 ;
      console.log("results",results,paginate);
      let list = results.results.bindings

      let displayTypes = types //["Person"]
      if(this.state.filters.datatype.indexOf("Any") === -1) { 
         displayTypes = displayTypes.filter(d => this.state.filters.datatype.indexOf(d) !== -1) ;
      }

      //if(displayTypes.length) displayTypes = displayTypes.sort(function(a,b) { return searchTypes.indexOf(a) - searchTypes.indexOf(b) })

      //console.log("list x types",list,types,displayTypes)

      for(let t of displayTypes) {

         let willBreak = false ;
         let dontShow = false ;
         let pagin ;
         let categIndex = 0, index = 0

         if(paginate.length) pagin = paginate[0]
         else pagin = { index:0, n:[0], pages:[0] };
         if(bookmarks) pagin.bookmarks = bookmarks
         
         /* // deprecated
         if(t === "Work" && pagin.gotoCateg !== undefined) { 
            //console.log("pagin.goto A",JSON.stringify(pagin,null,3))                  
            pagin.index = pagin.gotoCateg
            pagin.pages = pagin.pages.slice(0,pagin.gotoCateg+1)
            pagin.n = pagin.n.slice(0,pagin.gotoCateg+1)
            //console.log("pagin.goto Z",JSON.stringify(pagin,null,3))
         }
         */

         if(this.state.uriPage && pagin.pages && pagin.pages.length > this.state.uriPage) pagin.index = this.state.uriPage
         
         if(t === "Any") continue ;

         //console.log("t",t,list,pagin)

         let iniTitle = false 
         let sublist = list[t.toLowerCase()+"s"]         
         //if(!sublist) sublist = list[bdo+t]         
         let cpt = 0
         n = 0
         let begin = pagin.pages[pagin.index]

         //console.log("begin",begin,JSON.stringify(counts,null,3))

         let categ = "Other" ;
         let end = n
         let max_cpt =  3
         let canCollapse = false 

         let findNext = false ;
         let findFirst = true ;

         let absi = -1
         let lastN
         
         let h5

         if(sublist) { for(let o of Object.keys(sublist))
         {
            if(!iniTitle) {
               iniTitle = true
               let _t = t.toLowerCase()
               if(_t === "work" && this.props.isInstance) _t = "instance"
               if(displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) message.push(<MenuItem  onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h4>{I18n.t("types."+t.toLowerCase())+"s"+(false && displayTypes.length>1&&counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);
               else message.push(<MenuItem><h4>{I18n.t("types."+_t)+"s"+(false && displayTypes.length>=1&&counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);
            }
            absi ++ ;

            //console.log("cpt",absi,cpt,n,begin,findFirst,findNext,o) //,sublist[o])

            if(absi < begin && findFirst) { cpt++ ; m++ ;  continue; }
            else if(cpt == begin && !findNext && findFirst) {
               cpt = 0 ;
               m = 0 ;
               findFirst = false ;
               n = pagin.n[pagin.index];
               //console.log("=0",n)
            }

            //message.push(["cpt="+cpt+"="+absi,<br/>])

            let label ; // sublist[o].filter((e) => (e.type && e.type.match(/prefLabelMatch$/)))[0]
            let sList = sublist[o].filter(e => e.type && e.type.endsWith("abelMatch") )   //( (e) => (e.type && e.type.match(/(prefLabel(Match)?|eTextTitle)$/)))
            if(!sList.length) sList = sublist[o].filter(e => (e.type && e.type === skos+"prefLabel")) //.match(/(prefLabel(Match)?|eTextTitle)$/)))

            /* // deprecated 
            let listOrder = { "prefLabelMatch$" : 1, "prefLabel$":2,"eTextTitle$":3 }
            sList = _.sortBy(sList, (e) => {
               for(let k of Object.keys(listOrder)) { if(e.type && e.type.match(new RegExp(k))) return listOrder[k] }
            })
            */

            //console.log("sList",o,sublist[o],JSON.stringify(sList,null,3));

            label = getLangLabel(this,"",sList) // ,true)
            if(label && label.length > 0) label = label[0]

            if(!label) label = { lang:"?", value:"?" }

            let preProps = sublist[o].filter((e) => e.type && e.type.match(/relationType$/ )).map(e => this.props.ontology[e.value])

            //console.log("label",label) //,sList,sublist[o]) //,preProps)


            let r = {
               //f  : { type: "uri", value:list[o].type },
               lit: label,
               s  : { type: "uri", value: o },
               match: sublist[o].filter((e) => {

                  let use = true ;

                  if(e.type && e.type.match(/relationType$/)) {
                     let prop = this.props.ontology[e.value]
                     //console.log("e",e,prop)
                     if(prop)
                        for(let p of preProps) {

                           //console.log("::",p,preProps) //p[rdfs+"subPropertyOf"])

                           if(p && (p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => q.value == e.value).length > 0
                              || p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(q => q.value == e.value).length > 0
                              || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => q.value == e.value).length > 0 )
                           ) {
                              use = false ;
                              break ;
                           }
                        }
                  }

                  //console.log("e",e,this.state.filters.facets)

                  return ( /*(this.state.filters.facets && e.type && this.state.filters.facets[e.type]) ||*/ use && (
                  ( this.props.language != "" ? e.value && ((e.value.match(/[↦↤]/) && e.type  && !e.type.match(/(creator)/) && (!e.type.match(/(prefLabelMatch$)/) || (!label.value.match(/[↦↤]/)))))
                                                            //|| e.type && e.type.match(/sameAs$/))
                                              : !e.lang && false && e.value !== bdo + "instanceOf" && (e.value.match(new RegExp(bdr+this.props.keyword.replace(/bdr:/,"")))
                                                            || (e.type && e.type.match(/relationType$/) ) ) )

                     ) ) } ).map(e => e.type.match(/prefLabelMatch$/) ? { ...e, type:skos+"prefLabel" }:e)
            }


            //console.log("r",r,label);

            // || (e.type && e.type.match(/[Ee]xpression/) )
            // || ( )

            // deprecated
            let isAbs = [] //= sublist[o].filter((e) => e.value && e.value.match(/Abstract/))
            let hasExpr = [] //= sublist[o].filter((e) => e.type && e.type.match(/HasExpression/))
            let isExpr = []//= sublist[o].filter((e) => e.type && e.type.match(/ExpressionOf/))

            let hasPart = sublist[o].filter((e) => e.type && e.type.match(/HasPart/))
            let hasRoot = sublist[o].filter((e) => e.type && e.type.match(/HasRoot/) && e.value && !e.value.match(o) )
            let workLab = sublist[o].filter((e) => e.type && e.type.match(/workLabel/))
            let creator = sublist[o].filter((e) => e.type && e.type.match(/creator/))

            let addTmpProp = (tab,prop,lab,multiP:boolean = false) => {

               if(tab.length > 0)
               {
                  let subL = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(prop)))) ///(work(Has)?Expression)|(workHasRoot)/) ) )                  

                  let subR,label,lang ;
                  if(subL.length == 1) {
                     subR = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(lab)))) //(rootPrefLabel)|(prefLabel(Has)?Expression)/) ) )
                     if(subR.length > 0) {
                        let tLab = getLangLabel(this,"",subR)
                        lang = tLab["xml:lang"]
                        if(!lang) lang = tLab["lang"]
                        label = tLab["value"]
                     }
                  }
                  else if(multiP) {
                     subR = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(lab))))
                     if(subR.length > 0) {
                        let tLab = getLangLabel(this,"",subR)
                        lang = tLab["xml:lang"]
                        if(!lang) lang = tLab["lang"]
                        label = tLab["value"]
                     }
                  }

                  //console.log("sub",subL,subR,label);

                  let withKey ;
                  if(!multiP) withKey= subL.reduce((acc,e) => {
                     if(!acc[e.type]) acc[e.type] = []
                     acc[e.type] = [].concat(acc[e.type]) ;
                     acc[e.type].push(e.value);
                     return acc;
                  }, {} )
                  else withKey = subL.reduce((acc,e) => {
                     acc[e.value.toLowerCase()] = label
                     return acc;
                  }, {} )

                  //console.log("wK",withKey);

                  r.match = r.match.concat( Object.keys(withKey).sort().reduce((acc,e)=>{
                     let elem = {"type":e,"value":withKey[e],lang}
                     if(label) elem = { ...elem, "tmpLabel":label}
                     acc.push(elem);
                     return acc;
                  } ,[]) )

                  //console.log("r.match",r.match)
               }

            }

            // deprecated
            //addTmpProp(hasExpr,"workHasExpression","prefLabelHasExpression");
            //addTmpProp(isExpr,"workExpression","prefLabelExpression");

            addTmpProp(creator,"creatorRole","creatorLabel", true);
            addTmpProp(hasRoot,"inRootInstance","rootPrefLabel");
            addTmpProp(workLab,"forWork","workLabel");

            let k = this.props.keyword.replace(/"/g,"")

            let id = r.s.value
            if(sublist[o].filter(e => e.type && e.type === tmp+"forEtext").length > 0) id = sublist[o].filter(e => e.type === tmp+"forEtext")[0].value
            if(id.match(/bdrc[.]io/)) id = id.replace(/^.*?([^/]+)$/,"$1")

            let lit ;
            if(r.lit) { lit = highlight(r.lit.value,k) }
            let lang ;
            if(r.lit) lang= r.lit["lang"]
            if(r.lit && !lang) lang = r.lit["xml:lang"]
            let typ ;
            //if(r.f && r.f.value) typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")


            //console.log("r",o,sublist[o],r,label,lit);

            let filtered = true ;

            if(this.state.filters.datatype.indexOf("Any") === -1 && this.state.filters && this.state.filters.facets)

               for(let k of Object.keys(this.state.filters.facets)) {

                  let v = this.state.filters.facets[k]

                  let exclude = this.state.filters.exclude
                  if(exclude) exclude = exclude[k]

                  //console.log("k",k,v,exclude)

                  let withProp = false, hasProp = false, isExclu = false                   
                  for(let e of sublist[o]) {

                     if(v.alt) { 
                        for(let a of v.alt) {
                           if(e.type === a) { 
                              hasProp = true ;
                              //console.log("e sub",e)
                              if( v.val.indexOf("Any") !== -1 || e.value === v.val || v.val.indexOf(e.value) !== -1 )  withProp = true ;                              
                              if(exclude && exclude.indexOf(e.value) !== -1) isExclu = true
                           }
                        }
                     }
                     else if(e.type === k) {
                        hasProp = true ;
                        if(v.indexOf("Any") !== -1 || e.value === v || v.indexOf(e.value) !== -1)  withProp = true ;                                                                       
                        if(exclude && exclude.indexOf(e.value) !== -1) isExclu = true
                     }
                  }

                  if(!exclude || !exclude.length) {
                     if((v.alt && v.val.indexOf("unspecified") !== -1) || (!v.alt && v.indexOf("unspecified") !== -1)) {
                        if( hasProp && !withProp ) filtered = false
                     }
                     else if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                        if( !withProp ) filtered = false
                     } 
                  }
                  else {
                     if((v.alt && v.val.indexOf("unspecified") !== -1) || (!v.alt && v.indexOf("unspecified") !== -1)) {
                        if( exclude.indexOf("unspecified") !== -1 && !hasProp ) filtered = false
                        if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                           if( withProp && isExclu ) filtered = false
                        } 
                     }                     
                     else if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                        if( withProp && isExclu ) filtered = false
                     } 
                  }



                  //if(isExclu) filtered = false

                  //console.log("hP",o, hasProp,withProp,isExclu,filtered) //,k,v) //,sublist[o])
               }

               //console.log("typ",typ,t,filtered)

               //if(this.state.filters.datatype.length == 0 || this.state.filters.datatype.indexOf("Any") !== -1 || this.state.filters.datatype.indexOf(typ) !== -1)
               if((!typ || typ === t) && filtered)
               {
                  if(findNext) {

                     let next = absi

                     pagin = {
                                 ...pagin,
                                 pages: pagin.pages.concat([next]),
                                 n: pagin.n.concat([end])
                              };

                     //console.log("good!",next,willBreak,JSON.stringify(pagin))

                     /*
                     if(this.state.paginate.pages.indexOf(next) === -1)
                        this.setState({...this.state,
                           paginate:{...this.state.paginate,
                              pages: this.state.paginate.pages.concat([next]),
                              n: this.state.paginate.n.concat([end])
                           }});
                     */
                     findNext = false
                     dontShow = true
                     index ++ ;
                     
                     //console.log("index",index)

                     if(paginate.length && pagin.gotoCateg === undefined) break ;

                     /*
                     

                     if(displayTypes.length > 1)  continue; 
                     else if(t === "Any") break; 

                     */
                  }

                  //console.log("lit",lit,n,cpt,max_cpt,categ,isAbs)


                  let Tag,tip,categChange = false, showCateg = false, prevCateg = categ, tmpN = n, prevH5 = h5  ;
                  
                  if(pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb && pagin.bookmarks[categ].nb == n) { categChange = true; }

                  
                  if(isAbs.length > 0)        { Tag = CropFreeIcon ;     tip = "Abstract Work" ;       if(categ !== "Abstract") { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "Abstract" ; if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(hasExpr.length > 0) { Tag = CenterFocusStrong; tip = "Work Has Expression" ; if(categ !== "HasExpr")  { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "HasExpr" ;  if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(isExpr.length > 0)  { Tag = CenterFocusWeak;   tip = "Work Expression Of";   if(categ !== "ExprOf")   { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "ExprOf" ;   if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(categ !== "Other")  { Tag = CropDin;           tip = "Work" ;                                           if(                     cpt >= max_cpt)  { categChange = true ; }; categ = "Other";     if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } 
                  else if(categ === "Other")  { Tag = CropDin;           tip = "Work" ; if(t == "Work" && !findFirst && m == 0) { showCateg = true ; } ; if(t == "Work") { canCollapse = true ; } }
                  

                  if(Tag == CropDin && hasPart.length > 0) Tag = FilterNone;
               

                  if(t !== "Work") Tag = null
                  else {
                     if(showCateg) {
                        //if(displayTypes.length === 1) 
                        {
                           if(!pagin.bookmarks) pagin.bookmarks = {}
                           if(!pagin.bookmarks[categ]) { 
                              pagin.bookmarks[categ] = {i:absi}
                           }
                           //console.log("bookMa",JSON.stringify(pagin.bookmarks,null,3))

                           if(pagin.bookmarks[prevCateg] && pagin.bookmarks[prevCateg].i < absi && pagin.bookmarks[prevCateg].nb === undefined) pagin.bookmarks[prevCateg] = { ...pagin.bookmarks[prevCateg], nb:absi - pagin.bookmarks[prevCateg].i }

                           //console.log("bookMb",JSON.stringify(pagin.bookmarks,null,3))
                        }

                        //console.log("categC",categChange,lastN,tmpN,categ)

                        // // deprecated
                        // if(categChange && (cpt - lastN > 1 || tmpN > 3)) {// && (!pagin.bookmarks || (!pagin.bookmarks[categ] || !pagin.bookmarks[prevCateg] || pagin.bookmarks[categ] - pagin.bookmarks[prevCateg] > 3))) {
                        //    //console.log("bookM...",pagin.bookmarks)
                        //    message.push(<MenuItem className="menu-categ-collapse" onClick={this.setWorkCateg.bind(this,prevCateg,pagin)}><h5>{I18n.t(this.state.collapse[prevCateg]==false?"misc.hide":"misc.show" ) + " " + t + "s" + /*" / " + prevH5.replace(/ \([0-9]+\)$/,"")*/ (pagin.bookmarks[prevCateg].nb ? " ("+pagin.bookmarks[prevCateg].nb +")":"") /*+" "+prevCateg*/}</h5></MenuItem>);                      
                        // }
                        

                        //console.log("bookM",pagin.bookmarks)

                        h5 = tip
                        if(h5 === "Work") h5 = "Other"
                        else h5 = tip.replace(/ ?Work ?/,"")
                        //if(pagin && pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb) h5 += " ("+pagin.bookmarks[categ].nb+")"

                        /* // deprecated
                        if(!dontShow) message.push(
                           <MenuItem className="menu-categ" onClick={this.setWorkCateg.bind(this,categ,pagin)}>
                              <h5>{h5}</h5>
                              { pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb > 3 && (this.state.collapse[categ]==false?<ExpandLess/>:<ExpandMore/>) }
                           </MenuItem>);
                        */

                        //console.log("categIndex",categIndex,h5)
                     }  
                  }

                  //console.log("lit",lit,n)

                  //console.log("willB",n,willBreak,categ)
                  //if(n != 0 && willBreak) break;
                  //else willBreak = false ;

                  n ++;
                  end = n ;
                  if(!willBreak && !dontShow) { 
                     lastN = cpt ;
                     //console.log("lastN",lastN)
                     message.push(this.makeResult(id,n,t,lit,lang,tip,Tag,null,r.match,k,sublist[o],r.lit.value))
                  }
                  cpt ++;
                  let isCollapsed = ( canCollapse && !(this.state.collapse[categ] || this.state.collapse[categ] == undefined))                  
                  if(!isCollapsed || n <= 3) m++ ;                  
                  
                  //console.log("cpt",cpt,categ,canCollapse,isCollapsed,m,this.state.collapse[categ],index,n,willBreak,lastN,absi)

                  
                  if(displayTypes.length > 1 || t == "Work") {
                     if(cpt >= max_cpt&& (t != "Work" || isCollapsed)) {                      
                        if(categ == "Other") { break ; } 
                        else { willBreak = true;  } 
                     }
                  }
                  

                  if(displayTypes.length === 1)
                  {
                     if(m > 0 && m % 50 == 0 && !findFirst) {

                        findNext = true ;                     
                     }  
                  }
               
               }
            }
            if(cpt == 0 ) { message.push(<Typography style={{margin:"20px 40px"}}><Translate value="search.filters.noresults"/></Typography>);}

         }
         if(pagin.index == pagin.pages.length - 1) {

            //  // deprecated
            // if(cpt >= max_cpt && cpt - lastN >= 1 && Object.keys(sublist).length > 3 && (t != "Work" || pagin.bookmarks[categ].nb > 3) ) {
            //    //if(displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) 

            //    if((displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) && t !== "Work") 
            //        message.push(<MenuItem className="menu-categ-collapse" onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h5>{I18n.t("misc.show") +" "+t+"s" +(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")/*+" "+categ*/}</h5></MenuItem>);                      
            //    else 
            //    { 
            //       if(t === "Work") 
            //          message.push(<MenuItem className="menu-categ-collapse" onClick={this.setWorkCateg.bind(this,categ,pagin)}><h5>{I18n.t(this.state.collapse[categ]==false?"misc.hide":"misc.show") + " " + t + "s" + /*" / " + h5.replace(/ \([0-9]+\)$/,"") +*/ (pagin.bookmarks[categ].nb ? " ("+pagin.bookmarks[categ].nb +")":"") /*+" "+categ*/}</h5></MenuItem>);                      

            //       if(/*t !== "Work" &&*/ displayTypes.length === 1 && displayTypes.indexOf("Any") === -1) 
            //          message.push(<MenuItem className="menu-categ-collapse datatype" onClick={(e)=> this.resetDT() }><h5>{I18n.t("misc.datatype")  /*+t+" "+categ*/}</h5></MenuItem>);                         
            //    }
            // }
            // else if(/*t !== "Work" &&*/ displayTypes.length === 1 && displayTypes.indexOf("Any") === -1 && iniTitle) 
            //    message.push(<MenuItem className="menu-categ-collapse datatype" onClick={(e)=>this.handleCheck(e,"Any",true,{},true)}><h5>{I18n.t("misc.datatype")  /*+" "+categ*/}</h5></MenuItem>);                      
         }

         if(!iniTitle && (displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) ) {
             iniTitle = true
             
             // // deprecated
             // message.push(<MenuItem  onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h4>{I18n.t("types."+t.toLowerCase())+"s"+(false && displayTypes.length>1 && counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);
             // message.push(<MenuItem className="menu-categ-collapse" onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h5>{I18n.t("misc.show") +" "+t+"s"+(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"") /*" "+categ */ }</h5></MenuItem>);                      
          }
         

         //console.log("end pagin",pagin,paginate)
         if(pagin) {
            

            if(pagin && pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb === undefined) { 
               pagin.bookmarks[categ] = { ...pagin.bookmarks[categ], nb:Object.keys(sublist).length - pagin.bookmarks[categ].i }
               //console.log("bookM2",JSON.stringify(pagin.bookmarks,null,3))
            }

            if(pagin.gotoCateg !== undefined && paginate[0]) { paginate.length = 0; delete pagin.gotoCateg ; }
            if(paginate.length == 0) { paginate.push(pagin); }
         }
      }

   }

   prepareResults()
   {

      let types = ["Any"]
      let counts = { "datatype" : { "Any" : 0 } }
      let id = this.state.filters.datatype.sort() + "#" + this.props.keyword + "@" + this.props.language
      let message = []
      let results = this.handleResOrOnto(message,id);      
      let resMatch = message.length
      let resLength = 0;
      if(results && results.results && results.results.bindings)
         resLength = Object.keys(results.results.bindings).filter(d => { 
                        let t = d[0].toUpperCase()+d.slice(1).replace(/s$/,"")
                        //console.log("t",t)
                        return searchTypes.indexOf(t) !== -1 
                     }).reduce((acc,e)=>acc+Object.keys(results.results.bindings[e]).length,0)

      //console.log("res::",id,results,message,message.length,resLength,resMatch,this.props.loading)

      let sta = { ...this.state }

      this.setTypeCounts(types,counts);

      if(!resMatch && ((this.props.failures[this.props.keyword]) || (counts.datatype["Any"] === 0 && !this.props.loading && !this.props.datatypes) ) ) { //resMatch == 0 && (!results  || results.numResults == 0) ) {
         
         if(!this.props.loading && (this.props.failures[this.props.keyword] || !this.props.resource || !this.props.resource[this.props.keyword]) ) {             
            message.push(
               <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                  No result found. 
               </Typography>
            )
         }
         if(!sta.results || !sta.results[id] || (sta.results[id].message && message && sta.results[id].message.length != message.length))
         {
            let change
            if(!sta.results) sta.results = {}
            if(!sta.results[id]) {
               sta.results[id] = { message, types, counts, resMatch, results }
               this.setState(sta);
            }
         }
      }
      else 
      {
         //if(sta.results) console.log("results::",JSON.stringify(Object.keys(sta.results),null,3),sta)

         /*
         if(!this.props.datatypes || !this.props.datatypes.metadata)
         {
            //console.log("dtp?",this.props.datatypes)
         }
         else {
            
         }
         */

         /*
         console.log("sta?",sta.id !== id,sta.repage,"=repage",
            !sta.results,
            !sta.results || !sta.results[id], 
            sta.results && sta.results[id] && (sta.results[id].resLength != resLength),
            sta.results && sta.results[id] && (sta.results[id].resMatch != resMatch),
            sta.results && sta.results[id] && sta.results[id].message && sta.results[id].message.length <= 1, 
            sta.results && sta.results[id] && sta.results[id].counts && sta.results[id].counts.datatype && Object.keys(sta.results[id].counts.datatype) && Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length)
         */
         let paginate = [], bookmarks, noBookM = false;
         if(sta.id !== id || sta.repage 
         || !sta.results 
         || !sta.results[id] 
         || (sta.results[id].resLength != resLength) 
         || (sta.results[id].resMatch != resMatch) 
         || ( sta.results[id].message.length <= 1) 
         || Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length ) { 
            
            if(sta.id == id && this.state.paginate && this.state.paginate.pages && this.state.paginate.pages.length > 1) paginate = [ this.state.paginate ]
            if(sta.results && sta.results[id] && sta.results[id].bookmarks) bookmarks = sta.results[id].bookmarks                        
            else noBookM = true

            //console.log("paginate?",JSON.stringify(paginate))

            if(results) this.handleResults(types,counts,message,results,paginate,bookmarks);
            
            //console.log("bookM:",JSON.stringify(paginate,null,3))
            
         }
         else {
            message = sta.results[id].message
            paginate = [ sta.results[id].paginate ]
            bookmarks = sta.results[id].bookmarks      
            //console.log("bookM!",JSON.stringify(paginate,null,3))
         }

         //console.log("mesg",id,message,types,counts,JSON.stringify(paginate,null,3))

         if(sta.id !== id || sta.repage || !sta.results || !sta.results[id] || (sta.results[id].resLength != resLength) || (sta.results[id].resMatch != resMatch) || ( sta.results[id].message.length < message.length ) || Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length) {
            if(!sta.results) sta.results = {}
            if(!sta.results[id]) sta.results[id] = {}
            
            let newSta = { message, types, counts, resMatch, resLength, results }
            if(bookmarks) { 
               newSta.bookmarks = bookmarks
            }
            if(paginate[0]) { 
               newSta.paginate = paginate[0]
               newSta.bookmarks = { ...(bookmarks?bookmarks:paginate[0].bookmarks) }
               delete paginate[0].bookmarks
               sta.paginate = paginate[0]
               sta.paginate.bookmarks = newSta.bookmarks
            }
            //console.log("bookM?",JSON.stringify(newSta.paginate,null,3))
            sta.results[id] = newSta
            sta.repage = false
            sta.id = id

            if(noBookM && paginate[0] && paginate[0].bookmarks) sta.repage = true

            //else sta.repage = false
            
            //console.log("repage?",sta.repage)

            this.setState(sta);
         }
      }

      

      return id ;
   }

   subcount(u,v) 
   {     
      if(this.props.metadata && this.props.metadata[u] && this.props.metadata[u][v] && this.props.metadata[u][v].i !== undefined)
         return this.props.metadata[u][v].i + " / "
      else
         return ""
   }

   renderFilterTag(isText:boolean=true,t, k, f) {      
      let t_ = t,k_ = k,isExclu = this.state.filters.exclude && this.state.filters.exclude[t] && this.state.filters.exclude[t].includes(k)
      if(!isText) {
         t_ = getPropLabel(this,t,false) 
         k_ = getPropLabel(this,k,false)
         t = getPropLabel(this,t) 
         k = getPropLabel(this,k)
      }
      else { t = <span>{t}</span>; k = <span>{k}</span> }
      return <a title={(!isExclu?"Include":"Exclude")+" results with "+t_+": "+ k_} class={ "active-filter " + (isExclu?"exclu":"") }><span>{t}: <b>{k}</b></span><a title={I18n.t("Lsidebar.activeF.remove")} onClick={f.bind(this)}><Close/></a></a>
   }

   resetFilters(e) {
      
      let {pathname,search} = this.props.history.location
      
      if(!this.props.isInstance) this.props.history.push({pathname,search:search.replace(/(&([tfin]|pg)=[^&]+)/g,"")+"&t="+this.state.filters.datatype[0]})
      else this.props.history.push({pathname,search:this.state.backToWorks})

      //this.setState({...this.state, repage:true, uriPage:0, scrolled:1, filters:{ datatype: this.state.filters.datatype } }  )
   }

   treeWidget(j,meta,counts,jlabel,jpre) {
      if(j == "tree") { // && meta[j]["@graph"]) { //
         let tree ;
         if(meta[j]) tree = meta[j]["@graph"]

         //console.log("meta tree",tree,meta[j],counts)

         if(tree && tree[0]
            && this.state.filters && this.state.filters.datatype
            && counts["datatype"][this.state.filters.datatype[0]])
         {
            if(tree[0]["taxHasSubClass"].indexOf("Any") === -1)
            {
               tree[0]['taxHasSubClass'] = ['Any'].concat(tree[0]['taxHasSubClass'])
               tree.splice(1,0,{"@id":"Any",
                  taxHasSubClass:[],"skos:prefLabel":[],
                  ["tmp:count"]:counts["datatype"][this.state.filters.datatype[0]]})
            }

            return this.widget(jlabel,j,this.subWidget(tree,jpre,tree[0]['taxHasSubClass'],true,j));
         }
      }
      else { //sort according to ontology properties hierarchy
         let tree = {}, tmProps = Object.keys(meta[j]).map(e => e), change = false
         //let rooTax = false
         do // until every property has been put somewhere
         {
            //console.log("loop",JSON.stringify(tmProps,null,3))
            change = false ;
            for(let i in tmProps) { // try each one
               let k = tmProps[i]
               let p = this.props.dictionary[k]

               //console.log("p",k,p)

               /* // not really useful, better change bdr:BoTibt label to "Tibetan in Tibetan script" (see bdr:EnLatn)
               let isSubClassOfASubClassOfLangScript ;
               if(p && p[rdfs+"subClassOf"]) for(let q of p[rdfs+"subClassOf"]) {
                  q = this.props.dictionary[q.value]
                  if(q && q[rdfs+"subClassOf"] && q[rdfs+"subClassOf"].filter(e => e.value === bdo+"LangScript").length) {
                     isSubClassOfASubClassOfLangScript = true ;
                     break ;
                  }
               }
               */

               if(!p || (!p[rdfs+"subPropertyOf"]
                  && (!p[rdfs+"subClassOf"] || p[rdfs+"subClassOf"].filter(e => e.value == bdo+"Event").length != 0  || p[rdfs+"subClassOf"].filter(e => e.value == bdo+"LangScript").length != 0 
                                             //|| isSubClassOfASubClassOfLangScript 
                  )
                  && (!p[bdo+"taxSubClassOf"] || p[bdo+"taxSubClassOf"].filter(e => e.value == bdr+"LanguageTaxonomy").length != 0 ) ) ) // is it a root property ?
               {
                  //console.log("root",k,p)
                  tree[k] = {} ;
                  delete tmProps[i];
                  change = true ;
                  break ;
               }
               else // find its root property in tree
               {
                  change = this.inserTree(k,p,tree)
                  //console.log("inT",change)
                  if(change) {
                     delete tmProps[i];
                     break ;
                  }
               }
            }
            tmProps = tmProps.filter(String)

            //console.log("ici?",tmProps,change)
            //if(rooTax) break ;

            if(!change) { //} && !rooTax) {
               //console.log("!no change!")
               for(let i in tmProps) {
                  let k = tmProps[i]
                  let p = this.props.dictionary[k]
                  // is it a root property ?
                  //console.log("k?",k,p)
                  if(p && p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                  {
                     tmProps = tmProps.concat(p[bdo+"taxSubClassOf"].map(e => e.value));
                     //console.log(" k1",k,tmProps)
                     change = true ;
                     //rooTax = true ;
                  }
                  else if(p && p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                  {
                     tmProps = tmProps.concat(p[rdfs+"subClassOf"].map(e => e.value));
                     //console.log(" k2",k,tmProps)
                     change = true ;
                     //rooTax = true ;
                  }
               }
               if(!change)break;
            }

         }
         while(tmProps.length > 0);

         //console.log("inserTree",tree)
         tree = this.counTree(tree,meta[j],counts["datatype"][this.state.filters.datatype[0]],j)
         //console.log("counTree",JSON.stringify(tree,null,3),j)

         return this.widget(jlabel,j,this.subWidget(tree,jpre,tree[0]['taxHasSubClass'],false,j));
      }

      return ;
   }


   widget(title:string,txt:string,inCollapse:Component)  { 
      return (
         [<ListItem key={1} className="widget-header"
            onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, [txt]:!this.state.collapse[txt]} }); } }
            >
            <Typography  className="widget-title" >{title}</Typography>
            { this.state.collapse[txt] ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         <Collapse key={2}
            in={this.state.collapse[txt]}
            className={["collapse ",this.state.collapse[txt]?"open":"close"].join(" ")}
            >
               {inCollapse}
         </Collapse> ]
      )
  }

   subWidget(tree:[],jpre:string,subs:[],disable:boolean=false,tag:string) {

      if(!Array.isArray(subs)) subs = [ subs ]

      subs = subs.map(str => {
         let index
         let a = tree.filter(e => e["@id"] == str)
         if(a.length > 0 && a[0]["tmp:count"]) index = Number(a[0]["tmp:count"])

         return ({str,index})
      })
      subs = _.orderBy(subs,'index','desc').map(e => e.str)

      //console.log("subW",tree,subs,jpre,tag)

      let checkbox = subs.map(e => {

         if(e === bdr+"LanguageTaxonomy") return ;

         let elem = tree.filter(f => f["@id"] == e)

         //console.log("elem",elem,e)

         if(elem.length > 0) elem = elem[0]
         else return

         let label = getLangLabel(this,"",elem["skos:prefLabel"],true) 
         //if(label && label.value) label = label.value
         //else if(label && label["@value"]) label = label["@value"]
         if(!label) label = { value: this.fullname(e,elem["skos:prefLabel"],true) }

         //console.log("check",e,label,elem,disable);

         let cpt   = tree.filter(f => f["@id"] == e)[0]["tmp:count"]
         let cpt_i                
         let id = elem["@id"].replace(/bdr:/,bdr)
         //console.log("@id",id)
         if(this.props.metadata && this.props.metadata[tag] && this.props.metadata[tag][id]) { 
            cpt_i = this.props.metadata[tag][id].i + " / "
         }
         else {
            cpt_i = tree.filter(f => f["@id"] == e)[0]["tmp:subCount"]
            if(!cpt_i) cpt_i = ""
         }

         let checkable = tree.filter(f => f["@id"] == e)
         if(checkable.length > 0 && checkable[0].checkSub)
            checkable = checkable[0]["taxHasSubClass"]
         else
            checkable = [e]

         //let isdisabled = true
         if( disable && elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0)
         {
            if(!Array.isArray(elem["taxHasSubClass"])) elem["taxHasSubClass"] = [ elem["taxHasSubClass"] ]

            checkable = []
            let tmp = elem["taxHasSubClass"].map(e => e)
            while(tmp.length > 0)
            {
               let t = tree.filter(f => f["@id"] == tmp[0])

               //console.log("t",t);

               if(t.length > 0) {
                  t = t[0]
                  if(t) {
                     if(!t["taxHasSubClass"] || t["taxHasSubClass"].length == 0)  { checkable.push(tmp[0]); }
                     else tmp = tmp.concat(t["taxHasSubClass"])
                  }
               }

               delete tmp[0]
               tmp = tmp.filter(String)
               //console.log("tmp",tmp,checkable)
            }
         }

         checkable = checkable.map(e => e.replace(/bdr:/,bdr))

         let checked = this.state.filters.facets && this.state.filters.facets[jpre]

         //console.log("checked1",jpre,e,checked)


         if(!checked) {
            if(label === "Any") checked = true ;
            else checked = false
         }
         else {
            let toCheck = this.state.filters.facets[jpre]
            if(toCheck.val) toCheck = toCheck.val
            if(checkable.indexOf(e) === -1) {
               for(let c of checkable) {
                  checked = checked && toCheck.indexOf(c) !== -1  ;
               }
            }
            else checked = toCheck.indexOf(e) !== -1
         }

         //console.log("checkedN",checked)

         let isExclu = this.state.filters.exclude && this.state.filters.exclude[jpre] && checkable && checkable.reduce( (acc,k) => (acc && this.state.filters.exclude[jpre].includes(k)), true )

         if(label !== "Any" && (label.value !== "Any") && label !== "unspecified") { 

            let val = getVal(label), lang = getLang(label)
            if(!lang) label = val
            else label = <span lang={lang}>{val}</span>

            let disabled = cpt_i.startsWith("0")&&!checked

            return (
               <div key={e} style={{width:"auto",textAlign:"left"}} className="widget searchWidget">
                  <FormControlLabel
                     {... disabled?{disabled:true}:{}}
                     control={
                        <Checkbox
                           checked={checked}
                           className={"checkbox"}
                           icon={<CheckBoxOutlineBlank/>}
                           checkedIcon={isExclu ? <Close className="excl"/>:<CheckBox />}
                           onChange={(event, checked) => this.handleCheckFacet(event,jpre,checkable,checked)}
                        />

                     }
                     label={<span>{label}&nbsp;<span class='facet-count-block'>{"("}<span class="facet-count">{cpt_i+cpt}</span>{")"}</span></span>}
                  />
                  { !isExclu && label !== "Any" && <div class="exclude"><Close onClick={(event, checked) => this.handleCheckFacet(event,jpre,checkable,true,true)} /></div> }
                  {
                     elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0 &&
                     [
                        <span className={"subcollapse " + (disabled?"off":"")} /*style={{width:"335px"}}*/
                              onClick={(ev) => { this.setState({collapse:{ ...this.state.collapse, [e]:!this.state.collapse[e]} }); } }>
                        { this.state.collapse[e] ? <ExpandLess /> : <ExpandMore />}
                        </span>,
                        <Collapse
                           in={this.state.collapse[e]}
                           className={["subcollapse",this.state.collapse[e]?"open":"close"].join(" ")}
                           style={{paddingLeft:20+"px"}} // ,marginBottom:"30px"
                           >
                              { this.subWidget(tree,jpre,elem["taxHasSubClass"],disable,tag) }
                        </Collapse>
                     ]
                  }
               </div>
            )
         }
      })

      return ( checkbox )
   }

   render_filters(types,counts,sortByList,reverseSort,facetWidgets) {
      return ( <div className={"SidePane left"}>
                  {/* <IconButton className="close" onClick={e => this.setState({...this.state,leftPane:false,closeLeftPane:true})}><Close/></IconButton> */}
               { //this.props.datatypes && (results ? results.numResults > 0:true) &&
                  <div style={{ /*minWidth:"335px",*/ position:"relative"}}>                     
                     <Typography className="sidebar-title">
                        <Translate value="Lsidebar.title" />
                     </Typography>
                     { /* // deprecated, now "Provider" facet
                        this.widget(I18n.t("Lsidebar.collection.title"),"collection",
                        ["BDRC" ,"rKTs" ].map((i) => <div key={i} style={{width:"150px",textAlign:"left"}} className="searchWidget">
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       {... i=="rKTs" ?{}:{defaultChecked:true}}
                                       disabled={true}
                                       className="checkbox disabled"
                                       icon={<PanoramaFishEye/>}
                                       checkedIcon={<CheckCircle/>}
                                       //onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                    />

                                 }
                                 label={i}
                              /></div> ))
                     */}                     
                     {  this.props.datatypes && !this.props.datatypes.hash &&
                        <Loader loaded={false} className="datatypesLoader" style={{position:"relative"}}/>
                     }
                     <ListItem className="widget-header"                        
                        onClick={(e) => {
                           //if(!(this.props.datatypes && !this.props.datatypes.hash))
                              this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography className="widget-title">
                           <Translate value="Lsidebar.datatypes.title"/>
                        </Typography>
                        { /*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />  }
                     </ListItem>
                     <Collapse
                        in={/*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"]}
                        className={["collapse ",  !(this.props.datatypes && !this.props.datatypes.hash)&&!this.state.collapse["datatype"]?"open":"close"].join(" ")}
                        >
                        <div>
                        { //facetList&&facetList.length > 0?facetList.sort((a,b) => { return a.props.label < b.props.label } ):
                              types.map((i) => {

                                 if(i==="Any") return

                                 //console.log("counts",i,counts,counts["datatype"][i],this.state.filters.datatype.indexOf(i))

                              let disabled = (!["Work","Person", "Place","Topic","Corporation","Role","Lineage","Etext"].includes(i)) // false // (!this.props.keyword && ["Any","Etext","Person","Work"].indexOf(i)===-1 && this.props.language  != "")
                           // || (this.props.language == "")

                              let count = counts["datatype"][i]
                              if(typeof count === "string") count = "~"+count

                              return (
                                 <div key={i} style={{textAlign:"left"}}  className="searchWidget">
                                    <FormControlLabel
                                       control={
                                          <Checkbox
                                             className={"checkbox "+(disabled?"disabled":"")}
                                             disabled={disabled}
                                             //{...i=="Any"?{defaultChecked:true}:{}}
                                             color="black"
                                             checked={this.state.filters.datatype.indexOf(i) !== -1} 
                                             icon={<PanoramaFishEye/>}
                                             checkedIcon={<CheckCircle/>}
                                             onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                          />

                                       }
                                       {...counts["datatype"][i]
                                       ?{label:<span>{I18n.t("types."+i.toLowerCase()) + " ("}<span class="facet-count">{count}</span>{")"}</span>}
                                       :{label:I18n.t("types."+i.toLowerCase())}}
                                    />
                                 </div>
                              )
                           }
                        )}
                        </div>
                     </Collapse>
                     
                     {  facetWidgets }
                  
                  </div>
               }
               </div>
            )
   }

   render() {

      let results
      let message = [],messageD = [];
      //let results ;
      let facetList = []
      let types = ["Any"]
      let loader ;
      let counts = { "datatype" : { "Any" : 0 } }
      let paginate,pageLinks
      const { isAuthenticated } = this.props.auth;
      let id ;

      if(!global.inTest) console.log("render",this.props.keyword,this.props,this.state,isAuthenticated(),this._customLang)
      // no search yet --> sample data
      if(!this.props.keyword || this.props.keyword == "")
      {
         if(this.props.config && this.props.config.links)
         {
            messageD.push(<h4 key={"sample"} style={{marginLeft:"16px"}}>Sample Resources</h4>)
            let i = 0
            for(let l of this.props.config.links) {
               //console.log("l",l)
               let who = getLangLabel(this,"", l.label)
               //console.log("who",who)
               messageD.push(<h5 key={i}>{l.title}</h5>)
               messageD.push(this.makeResult(l.id,null,getEntiType(l.id),who.value,who.lang,l.icon,TagTab[l.icon]))
               i++;
            }
            //message.push(this. akeResult("W19740",null,"Work","spyod 'jug'","bo-x-ewts","Abstract Work",TagTab["Abstract Work"]))
            //message.push(this. akeResult("P6161",null,"Person","zhi ba lha/","bo-x-ewts"))
         }

         types = this.state.searchTypes //[ /*"Any",*/ ...searchTypes.slice(1) ] //["Any","Person","Work","Corporation","Place", /*"Item",*/ "Etext","Role","Topic","Lineage"]
         /*
         let e = types.indexOf("Etext")
         if(e !== -1) { 
            delete types[e]
            types = types.filter(e => e)
            console.log("types",types)
         }
         */
         //types = types.sort()
      }
      else {
         
         id = this.prepareResults();

         //console.log("id",id)

         if(this.state.results && this.state.results[id])
         {
            results = this.state.results[id].results
            message = this.state.results[id].message
            counts = this.state.results[id].counts
            types = this.state.results[id].types
            paginate = this.state.results[id].paginate
            if(paginate && paginate.pages && paginate.pages.length > 1) {
               pageLinks = []
               let min = 1, max = paginate.pages.length
               if(max > 10) { 
                  min = paginate.index + 1 - 4 ;
                  if(min < 1) min = 1
                  max = min + 10 - 2
                  if(max > paginate.pages.length) max = paginate.pages.length
               }

               if(min > 1) pageLinks.push([<a onClick={this.goPage.bind(this,id,1)}>1</a>," ... "]) 
               for(let i = min ; i <= max ; i++) { pageLinks.push(<a onClick={this.goPage.bind(this,id,i)}>{((i-1)===this.state.paginate.index?<b><u>{i}</u></b>:i)}</a>) }
               if(max < paginate.pages.length) pageLinks.push([" ... ",<a onClick={this.goPage.bind(this,id,paginate.pages.length)}>{paginate.pages.length}</a>]) 
            }
            
            //console.log("prep",message,counts,types,paginate)

            if(!this.props.loading && !message.length && ( (this.props.searches[this.props.keyword+"@"+this.props.language] && !this.props.searches[this.props.keyword+"@"+this.props.language].numResults ) 
                  || (!this.props.loading && results && results.results && results.results.bindings && !results.results.bindings.numResults) ) 
                  || (!this.props.language && !this.props.loading && (counts["datatype"]["Any"] == 0 || !counts["datatype"][this.state.filters.datatype[0]]) ) )
               {
                  message = [
                     <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                           No result found.
                     </Typography>
                  ]
                   
            }
         }


      }


      let meta,metaK = [] ;
      if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1) {

         if(this.props.searches && this.props.searches[this.state.filters.datatype[0]]) {

            meta = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]

            //console.log("ici",meta)

            if(meta) meta = meta.metadata
            if(meta) {
               let that = this.props.config["facets"][this.state.filters.datatype[0]]
               if(that) that = Object.keys(that)
               metaK = Object.keys(meta).sort((a,b) => that.indexOf(a)<that.indexOf(b)?-1:(that.indexOf(a)>that.indexOf(b)?1:0))
            }

         }
      }

      //console.log("metaK",metaK)

      /*

         <Popover 
            className="menu-source"
            id={"menu-"+src+"-"+prettId} 
            anchorEl={(()=>{ console.log("where!!!???"); return this.state.anchor["menu-"+src+"-"+prettId]})()} 
            open={(() => { console.log("what!!!???"); return this.state.collapse["menu-"+src+"-"+prettId]})()}                       
            onClose={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}
            >
               <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}>View data in Public Digital Library</MenuItem>
               <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}><a href={id} class="menu-item-source" target="_blank">Go to external website</a></MenuItem>
         </Popover>

      */ 

      let showMenus = Object.keys(this._menus).map(id => 
            <Popover 
               transformOrigin={{ vertical: 'bottom', horizontal: 'left'}} 
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
               anchorEl={this.state.anchor[id]} 
               open={this.state.collapse[id]} 
               onClose={(ev) => this.handleCloseSourceMenu(ev,id)}>
                  <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,id)}>
                     <span className="void">View data in Public Digital Library</span>
                     <Link className="menu-item-source" to={"/show/"+this._menus[id].short}>View data in Public Digital Library</Link>
                  </MenuItem>
                  { this._menus[id].full.map( u =>  {
                     let short = shortUri(u)
                     return (
                        <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,id)}>
                           <span className="void">Open {this._menus[id].full.length > 1 ?<b>&nbsp;{short}&nbsp;</b>:"resource"} in {this._menus[id].src} website</span>
                           <a href={u} class="menu-item-source" target="_blank">Open {this._menus[id].full.length > 1 ?<b>&nbsp;{short}&nbsp;</b>:"resource"} in {this._menus[id].src} website</a>
                        </MenuItem>)
                     })
                  }
            </Popover> 
      );

      //console.log("messageD",this._menus,showMenus,messageD,message)

      const textStyle = {marginLeft:"15px",marginBottom:"10px",marginRight:"15px"}


      let facetWidgets 
      if(meta && this.state.filters.datatype && this.state.filters.datatype.length === 1 && this.state.filters.datatype.indexOf("Any") === -1 && this.props.config && this.props.ontology) {
         facetWidgets = metaK.map((j) =>
         {
            // no need for language on instances page
            if(j === "language" && this.props.isInstance ) return

            let jpre = this.props.config.facets[this.state.filters.datatype[0]][j]
            if(!jpre) jpre = j
            let jlabel ;
            if(facetLabel[j]) jlabel = facetLabel[j];   
            else {
               jlabel = this.props.ontology[jpre]
               if(jlabel) jlabel = jlabel["http://www.w3.org/2000/01/rdf-schema#label"]
               //if(jlabel) for(let l of jlabel) { if(l.lang == "en") jlabel = l.value }
               if(jlabel && jlabel.length) jlabel = jlabel[0].value
               else jlabel = this.pretty(jpre)
            }
            // need to fix this after info is not in ontology anymore... make tree from relation/langScript 
            if(["tree","relation","langScript"].indexOf(j) !== -1) {

               //console.log("widgeTree",j,jpre,meta[j],counts["datatype"],this.state.filters.datatype[0])

               return this.treeWidget(j,meta,counts,jlabel,jpre)
            }
            else
            {

               // + fix updateFacet "0 / 123" when results loaded with facet checked 
               // TODO 
               // - trigger foundFacetInfo when language preference changed (labels displayed/sorted depend on language)



               let meta_sort = Object.keys(meta[j])

               /* // deprecated 
               .sort((a,b) => {
                  if(Number(meta[j][a].n) < Number(meta[j][b].n)) return 1
                  else if(Number(meta[j][a].n) > Number(meta[j][b].n)) return -1
                  else return 0 ;
               });
               */

               delete meta_sort[meta_sort.indexOf("Any")]
               meta_sort.unshift("Any")


               meta[j]["Any"] =  { n: counts["datatype"][this.state.filters.datatype[0]]}

               let checkboxes = meta_sort.map(  (i) =>  {

                  let label = getPropLabel(this,i)

                  //console.log("label",i,j,jpre,label,meta)

                  let checked = this.state.filters.facets && this.state.filters.facets[jpre]
                  if(!checked) {
                     if(label === "Any") checked = true ;
                     else checked = false ;
                  }
                  else checked = this.state.filters.facets[jpre].indexOf(i) !== -1

                  // console.log("checked",checked)

                  let isExclu = this.state.filters.exclude && this.state.filters.exclude[jpre] && this.state.filters.exclude[jpre].includes(i)

                  let cpt_i = this.subcount(j,i)
                  
                  if(i !== "Any" && i !== "unspecified" && i !== "false") return (
                     <div key={i} style={{width:"auto",textAlign:"left"}} className="widget searchWidget">
                        <FormControlLabel
                           {... cpt_i.startsWith("0")&&!checked?{disabled:true}:{}}
                           control={
                              <Checkbox
                                 checked={checked}
                                 className="checkbox"
                                 icon={<CheckBoxOutlineBlank/>}
                                 checkedIcon={isExclu ? <Close className="excl"/>:<CheckBox/>}
                                 onChange={(event, checked) => this.handleCheckFacet(event,jpre,[i],checked)}
                              />

                           }
                           label={<a title={shortUri(i)}><span>{label}&nbsp;<span class="facet-count-block">{"("}<span class="facet-count">{cpt_i+meta[j][i].n}</span>{")"}</span></span></a>}
                        />
                        { !isExclu && label !== "Any" && <div class="exclude"><Close onClick={(event, checked) => this.handleCheckFacet(event,jpre,[i],true,true)} /></div> }
                     </div>
                  )
               })

               return (

                 this.widget(jlabel,j, 
                  <div style={{textAlign:"right"}}>
                     {checkboxes.slice(0,12)}                     
                     {checkboxes.length > 12 && 
                        [<Collapse in={this.state.collapse[j+"_widget"]}>
                           {checkboxes.slice(12)}
                        </Collapse>
                        ,
                        <span style={{fontSize:"12px",cursor:"pointer", marginTop:"5px",marginRight:"25px",display:"inline-block",fontWeight:700}} onClick={(e) => this.setState({...this.state, collapse:{...this.state.collapse, [j+"_widget"]:!this.state.collapse[j+"_widget"]}})}>
                           {(!this.state.collapse[j+"_widget"]?"Show all":"Hide")}
                        </span>]
                     }
                  </div> )
               )
            }
         })
      }

      let allSortByLists = { 
         "Work": [ "Popularity", "Closest Matches", "Work Title" ],
         "Person": [ "Popularity", "Closest Matches", ,"Person Name", "Year of Birth" ],
         "Place": [ "Popularity", "Closest Matches", ,"Place Name" ],
         "Instance": [ "Work Title", "Year of Publication" ],
         "Etext": [ "Closest Matches", "Number of Matching Chunks" ],
      }

      let sortByList = allSortByLists[this.state.filters.datatype[0]]
      
      // + fix sortBy for instances
      // + reset sort when switching datatype
      // TODO 

      if(this.props.isInstance) { 
         sortByList = allSortByLists["Instance"]
         //sortByList = null
      }

      let reverseSort = false
      if(this.props.sortBy && this.props.sortBy.endsWith("reverse")) reverseSort = true

      let {pathname,search} = this.props.history.location      

      this._refs["logo"] = React.createRef();

      return (
<div>

   {/* <Link to="/about">About</Link> */}

         {/* // embed UniversalViewer
            <div
            className="uv"
            data-locale="en-GB:English (GB),cy-GB:Cymraeg"
            data-config="/config.json"
            data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
            data-collectionindex="0"
            data-manifestindex="0"
            data-sequenceindex="0"
            data-canvasindex="0"
            data-zoom="-1.0064,0,3.0128,1.3791"
            data-rotation="0"
            style={{width:"100%",height:"calc(100vh)",backgroundColor: "#000"}}/> */}

          { top_right_menu(this) }

         <div className="App" style={{display:"flex"}}>
            <div className={"SearchPane"+(this.props.keyword ?" resultPage":"") }  ref={this._refs["logo"]}>            
            { showMenus }
               <div class="fond-logo">
                  <a id="logo" target="_blank" href="https://www.tbrc.org/">
                     <img src="/logo.svg" style={{width:"200px"}} />
                  </a>
               </div>
               {/* <h2>BUDA Platform</h2> */}
               {/* <h3>Buddhist Digital Resource Center</h3> */}
               <div id="search-bar">
               {/* <IconButton style={{marginRight:"15px"}} className={this.state.leftPane?"hidden":""} onClick={e => this.setState({...this.state,leftPane:!this.state.leftPane,closeLeftPane:!this.state.closeLeftPane})}>                  
                  <FontAwesomeIcon style={{fontSize:"21px"}} icon={faSlidersH} title="Refine Your Search"/>
               </IconButton> */}
               <SearchBar
                  closeIcon={<Close className="searchClose" style={ {color:"rgba(0,0,0,1.0)",opacity:1} } onClick={() => { this.props.history.push({pathname:"/",search:""}); this.props.onResetSearch();} }/>}
                  disabled={this.props.hostFailure}
                  onChange={(value:string) => { 
                     let language = this.state.language
                     let detec = narrowWithString(value, this.state.langDetect)
                     let possible = [ ...this.state.langPreset, ...langSelect ]
                     if(detec.length < 3) { 
                        if(detec[0] === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { language = p ; break ; } }
                        else if(detec[0] === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { language = p ; break ; } }
                        else if(["ewts","iast","deva","pinyin"].indexOf(detec[0]) !== -1) for(let p of possible) { if(p.match(new RegExp(detec[0]+"$"))) { language = p ; break ; } }
                     }
                     console.log("detec",possible,detec,this.state.langPreset,this.state.langDetect)
                     this.setState({keyword:value, dataSource: [ value, "possible suggestion","another possible suggestion"], language}); 
                  }}
                  onRequestSearch={this.requestSearch.bind(this)}
                  value={this.props.hostFailure?"Endpoint error: "+this.props.hostFailure+" ("+this.getEndpoint()+")":this.state.keyword !== undefined && this.state.keyword!==this.state.newKW?this.state.keyword:this.props.keyword&&this.state.newKW?this.state.newKW.replace(/\"/g,""):""}
                  style={{
                     marginTop: '0px',
                     width: "800px",
                     height:"60px"
                  }}
               />
               {/* work in progress
               <TextField
                  className="formControl"
                  id="lang"
                  label={<Translate value="lang.lg"/>}
                  //className={classes.textField}
                  value={I18n.t(languages[this.state.language])}
                  //onChange={this.handleChange('name')}
                  margin="normal"
               /> */}

              <FormControl className="formControl" style={{textAlign:"left"}}>
                <InputLabel htmlFor="language"><Translate value="lang.lg"/></InputLabel>

                <Select
                  value={this.getLanguage()}
                  onChange={this.handleLanguage}
                  open={this.state.langOpen}
                  onOpen={(e) => { console.log("open"); this.setState({...this.state,langOpen:true}) } }
                  onClose={this.handleLanguage} //(e) => this.setState({...this.state,langOpen:false})}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                >
                   { this.state.langPreset && this.state.langPreset.map((k) => (<MenuItem key={k} value={k}><Translate value={""+(searchLangSelec[k]?searchLangSelec[k]:languages[k])}/></MenuItem>))}
                   { this.state.langPreset && <hr style={{width:"90%"}}/> }
                   { langSelect.filter(e => !this.state.langPreset || this.state.langPreset.indexOf(e) === -1).map((k) => (<MenuItem key={k} value={k}><Translate value={""+(searchLangSelec[k]?searchLangSelec[k]:languages[k])}/></MenuItem>))}
                   {this.state.customLang &&  this.state.customLang.map(e => (
                      <MenuItem key="customLang_" value={e}>{e}</MenuItem>
                     ))
                   }
                   <MenuItem key="customLang" >
                      <TextField label="Other" name="language" onKeyPress={this.handleLanguage}
                        inputRef={(str) => { this._customLang = str;}} />
                   </MenuItem>
               </Select>

               { /* // proof of concept
                  this.state.language == "other" && <TextField
                  style={{marginBottom:"-32px"}}
                  //label=""
                  value={ this.state.customLang }
                  id="other-lang"
                  type="text"
                  inputRef={(str) => { this._customLang = str }}
                  onKeyPress={(e) => this.handleCustomLanguage(e)}
               /> */ }
              </FormControl>
               </div>
              { ( this.state.filters.facets || this.state.filters.datatype.indexOf("Any") === -1 )&& 
                        [ /*<Typography style={{fontSize:"23px",marginBottom:"20px",textAlign:"center"}}>
                           <Translate value="Lsidebar.activeF.title" />
                           <a title={I18n.t("Lsidebar.activeF.reset")} id="clear-filters" onClick={this.resetFilters.bind(this)}><RefreshIcon /></a>
                        </Typography>
                           ,*/
                           <div id="filters-UI">
                              <div>
                              { this.state.filters.datatype.filter(k => k !== "Any").map(k => this.renderFilterTag(true, "Type", k, (event, checked) => this.handleCheck(event, k, false) ) )}                              
                              { this.props.isInstance && this.state.backToWorks && this.state.filters.instance && this.renderFilterTag(false, "Instance Of", this.state.filters.instance, (event, checked) => {
                                 this.resetFilters(event)
                              } )  } 
                              { this.state.filters.facets?Object.keys(this.state.filters.facets).map(f => {
                                 let vals = this.state.filters.facets[f]
                                 if(vals.val) vals = vals.val
                                 return vals.filter(k => k !== "Any").map(v => 
                                    this.renderFilterTag(false, f, v, (event, checked) => this.handleCheckFacet(event, f, [ v ], false) ) 
                                 ) }
                              ):null }
                              <a title={I18n.t("Lsidebar.activeF.reset")} id="clear-filters" onClick={this.resetFilters.bind(this)}><span>Reset filters</span><RefreshIcon /></a>
                              </div>
                           </div>
                        ]
                  }
           <div id="data-checkbox">
            <FormGroup row>
               { 
                  // this.state.searchTypes.indexOf("Any") === -1 &&
                   searchTypes.map(d => 
                     <FormControlLabel className="data-checkbox" control={
                        <Checkbox onChange={(event, checked) => this.handleSearchTypes(event,d,checked)} 
                           checked={ this.state.searchTypes.indexOf("Any") !== -1 || this.state.searchTypes.indexOf(d) !== -1} 
                           color="black" icon={<CheckBoxOutlineBlank/>} checkedIcon={<CheckBox/>} /> 
                     } label={d} /> ) 
               }
               { /*
                  this.state.searchTypes.indexOf("Any") !== -1 &&
                     <FormControlLabel className="data-checkbox" control={
                        <Checkbox onChange={(event, checked) => this.handleSearchTypes(event,"Any",checked)} checked={ true } 
                           color="black" icon={<CheckBoxOutlineBlank/>} checkedIcon={<CheckBox/>} /> 
                     } label={"All Data Types"} />  
               */ }
            </FormGroup>
           </div>
           {  message.length > 0 && <div id="res-header">
               <div>
               {
                     sortByList && this.widget(I18n.t("Lsidebar.sortBy.title"),"sortBy",
                     (sortByList /*:["Year of Publication","Instance Title"]*/).map((i,n) => <div key={i} style={{width:"200px",textAlign:"left"}} className="searchWidget">
                           <FormControlLabel
                              control={
                                 <Checkbox
                                    checked={(this.props.sortBy && this.props.sortBy.startsWith(i.toLowerCase()) ) || (!this.props.sortBy && n === 0) }
                                    className="checkbox"
                                    icon={<PanoramaFishEye/>}
                                    checkedIcon={<CheckCircle/>}
                                    onChange={(event, checked) => this.updateSortBy(event, checked, i) }
                                 />

                              }
                              label={i}
                           /></div> ).concat([
                              <div key={99} style={{width:"auto",textAlign:"left",marginTop:"5px",paddingTop:"5px"}} className="searchWidget">
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       checked={reverseSort}
                                       className="checkbox"
                                       icon={<CheckBoxOutlineBlank/>}
                                       checkedIcon={<CheckBox/>}
                                       onChange={(event, checked) => this.reverseSortBy(event, checked) }
                                    />

                                 }
                                 label={"Reverse Order"}
                              /></div>
                     ])) 
                  }

                  <div id="pagine">
                     <div>
                           page { pageLinks } <span id="nb">{this.state.results[this.state.id]?this.state.results[this.state.id].resLength:"--"} Results</span>
                     </div>
                  </div>
               </div>
            </div>
           }
           <div id="res-container">
           {  message.length > 0 && this.render_filters(types,counts,sortByList,reverseSort,facetWidgets) }
               { /*false && this.state.keyword.length > 0 && this.state.dataSource.length > 0 &&
                  <div style={{
                     maxWidth: "700px",
                     margin: '0 auto',
                     zIndex:10,
                     position:"relative"
                  }}>
                     <Paper
                        style={{
                           width: "700px",
                           position: "absolute"
                        }}
                     >
                        <List>
                           { this.state.dataSource.map( (v) =>  <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e)=>this.setState({keyword:v,dataSource:[]})}>{v}</MenuItem> ) }
                        </List>
                     </Paper>
                  </div> */
               }
               { (this.props.loading || (this.props.datatypes && !this.props.datatypes.hash)) && <Loader className="mainloader"/> }
               { message.length == 0 && !this.props.loading &&
                  <List id="samples">
                     { messageD }
                  </List> }
               { message.length > 0 &&
                  <List key={2} id="results">
                     { this.props.isInstance && this.state.backToWorks && <a className="uri-link" style={{marginLeft:"16px"}} onClick={(event) => {
                           this.resetFilters(event)
                        }}>&lt; Back to Works</a> }
                     { message }
                     <div id="pagine">
                        <NavigateBefore
                           title="Previous page"
                           className={!paginate || paginate.index == 0 ? "hide":""}
                           onClick={this.prevPage.bind(this,id)}/>
                        <div style={{width:"60%"}}>
                              { pageLinks }
                        </div>
                        <NavigateNext
                           title="Next page"
                           className={!paginate || paginate.index == paginate.pages.length - 1 ? "hide":""}
                           onClick={this.nextPage.bind(this,id)} />
                     </div>
                  </List>
               }
               </div>
            </div>
            <LanguageSidePaneContainer />
         </div>
      </div>
      );
   }
}

export default withStyles(styles)(App);
