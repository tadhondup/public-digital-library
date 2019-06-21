

let jsEWTS,Sanscript,pinyin4js,__

export const importModules = async () => {

   try { // in react app
       __  = await require("lodash")
       jsEWTS = await require("jsewts/src/jsewts.js")
       Sanscript = await require("@sanskrit-coders/sanscript")
       pinyin4js = await require("pinyin4js")
   }
   catch(f) { // in embed iframe
      //console.log("exception",f)
       window.moduleLoaded = {}
       __ = eval('_')
       jsEWTS = window.moduleLoaded.JsEWTS = window.jsEWTS ;
       eval('require(["https://cdn.jsdelivr.net/npm/@sanskrit-coders/sanscript@1.0.2/sanscript.min.js"],(obj) => { Sanscript = obj; window.moduleLoaded.Sanscript = obj ; })')
       eval('require(["https://cdn.jsdelivr.net/npm/pinyin4js@1.3.18/dist/pinyin4js.js"],(obj) => { pinyin4js = PinyinHelper; window.moduleLoaded.pinyin4js = PinyinHelper ; })')
   }
}
importModules();

export const transliterators = {
   "bo":{ "bo-x-ewts": (val) => jsEWTS.toWylie(val) },
   "bo-x-ewts":{ "bo": (val) => jsEWTS.fromWylie(val) },
   "sa-deva":{ "sa-x-iast": (val) => Sanscript.t(val,"devanagari","iast") },
   "sa-x-iast":{ "sa-deva": (val) => Sanscript.t(val.toLowerCase(),"iast","devanagari") },
   "zh-hant":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) },
   "zh-hans":{ "zh-latn-pinyin" : (val) => pinyin4js.convertToPinyinString(val, ' ', pinyin4js.WITH_TONE_MARK) },
}

export function extendedPresets(preset)
{
    /*
   let preset_ =
      preset
      .map( k => [ k, ...(transliterators[k]?Object.keys(transliterators[k]):[]) ] )
      .reduce( (acc,k) => [...acc,...(k.length == 1?k:[k])],[])
      */

   let extPreset = { flat:[], translit:{} }
   for(let k of preset) {
      extPreset.flat.push(k)
      for(let t of Object.keys(transliterators)) {
         if(transliterators[t][k]) {
            extPreset.flat.push(t)
            extPreset.translit[t] = k
         }
      }
   }

   //console.log("extP",extPreset)

   return extPreset
}

export function sortLangScriptLabels(data,preset,translit)
{
   if(translit == undefined) translit={}
   if(!Array.isArray(data)) data = [ data ]
   //console.log("sort",preset,translit,data)
   let data_ = data.map(e => {
      let k = e["lang"]
      if(!k) k = e["xml:lang"]
      if(!k) k = e["@language"]
      if(!k) k = ""
      let v = e["value"]
      if(!v) v = e["@value"]
      if(!v) v = ""
      let i = preset.indexOf(k)
      if(i === -1) i = preset.length
      //console.log("k v",k,v,translit[k],e,transliterators)
      let tLit
      if(translit[k]) {
         tLit = {} ;
         let val = "@value", lan = "@language"
         if(!e["@value"]) {  val = "value" ; lan = "lang" ; tLit["type"] = "literal" ; }
         tLit[val] = transliterators[k][translit[k]](v)
         tLit[lan] = translit[k]
      }

      //console.log("tLit",tLit)

      return {e,tLit,i}
   })

   //console.log("_",data_)

   data_ = __.orderBy(data_,['i'],["asc"]).map(e => e.tLit?e.tLit:e.e )

   //console.log("data_",data_)

   return data_
}


window.extendedPresets = extendedPresets
window.sortLangScriptLabels = sortLangScriptLabels
