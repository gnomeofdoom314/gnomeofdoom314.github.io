import {MasterSpoils} from "./spoils.js";
import {MasterWeights} from "./spoils.js";
let regionSelected = "RedRegion"

const Ct = {
    Mine: 0,
    Miner: 0,
    Stone: {Red:0,Yellow:0,Green:0,Blue:0,Purple:0},
    Metal: {Red:0,Yellow:0,Green:0,Blue:0,Purple:0},
    Gems: {Red:0,Yellow:0,Green:0,Blue:0,Purple:0},
}

const Price = {
    Stone: {Red:1,Yellow:2,Green:3,Blue:4,Purple:5},
    Metal: {Red:2,Yellow:4,Green:6,Blue:8,Purple:10},
    Gems: {Red:3,Yellow:6,Green:9,Blue:12,Purple:15},
}
// Mats = ["Stone","Metal","Gems"]
// Colors = ["Red","Orange","Yellow","Chartreuse","Green","Emerald","Blue","Violet","Purple","Plum"]

const Cost = {
    Miner: 25,
    Prospect: 0,
}
let CostGrowthRateMiner = 5
let ProspectChanceNum = 1
let ProspectChanceDen = 1

const UserSpoils = {RedRegion: {Spoils: {}},YellowRegion: {Spoils: {}}}
const UserSpoilWeights = {RedRegion: {Weights: [], chanceNum: 1, chanceDen: 1,},YellowRegion: {Weights: [], chanceNum: 1, chanceDen: 1,}}

function makeSpoilList() {
    let list = ""
    
    if (Object.keys(UserSpoils[regionSelected]["Spoils"]).length < 1) {list = "No Spoils to be found!"}
    const totalWeight = (UserSpoilWeights[regionSelected]["Weights"]).reduce((sum, weight) => sum + weight, 0)
    for (let i = 0; i < Object.keys(UserSpoils[regionSelected]["Spoils"]).length; i++) {
        let foo = Object.keys(UserSpoils[regionSelected]["Spoils"])[i]
        let bar = UserSpoilWeights[regionSelected]["Weights"][i]
        let barCent = Math.round((bar/totalWeight*100))
        list = list+UserSpoils[regionSelected]["Spoils"][foo]["Color"]+" "+UserSpoils[regionSelected]["Spoils"][foo]["Mat"]+" "+barCent+"%"
            if (i < Object.keys(UserSpoils[regionSelected]["Spoils"]).length-1) {list = list+"<br>"}
    }
    return list
}
setAllInners(".spoilList",makeSpoilList())

function Prospect() {
    //1. Check to see if all Spoils have been found
    if (Object.keys(UserSpoils[regionSelected]["Spoils"]).length < Object.keys(MasterSpoils[regionSelected]["Spoils"]).length) {

        //2. Check to see if player has enough $ to prospect and then deduct Price if so
        console.log("$:"+Ct["Mine"],"Cost:"+Cost["Prospect"])
        if (Ct["Mine"] >= Cost["Prospect"]) {
            Ct["Mine"] -= Cost["Prospect"]
            setAllInners(".Mine",Ct["Mine"])

            //3. Create chance of Prospect Success, and roll against that chance.
            let chance = UserSpoilWeights[regionSelected]["chanceNum"]/UserSpoilWeights[regionSelected]["chanceDen"]
            let roll = Math.random()
            if (roll < chance) {

                //4. Increase Prospect Denomenator by a factor of 10 (Right now, Numerator stays the same, kinda by design),
                //and increase the cost to Prospect by 1 (essentially, the Prospect cost should = number of potential Spoils)
                UserSpoilWeights[regionSelected]["chanceDen"] = UserSpoilWeights[regionSelected]["chanceDen"]*10
                Cost["Prospect"] += 1
                setAllInners(".CostProspect",Cost["Prospect"])

                //5. Find the starting length of the current Spoils chart to use as a lookup in the MasterSpoils chart, then add the next Potential Spoil to the current chart
                let j = Object.keys(UserSpoils[regionSelected]["Spoils"]).length+1
                for (let i = Object.keys(UserSpoils[regionSelected]["Spoils"]).length; i < j; i++) {
                    let foo = Object.keys(MasterSpoils[regionSelected]["Spoils"])[i]
                    console.log("foo: ",foo)
                    UserSpoils[regionSelected]["Spoils"][foo] = MasterSpoils[regionSelected]["Spoils"][foo]
                    let bar = Object.keys(MasterWeights[regionSelected]["Weights"])[i]
                    console.log("bar: ",bar)
                    UserSpoilWeights[regionSelected]["Weights"][bar] = MasterWeights[regionSelected]["Weights"][bar]
                    consoleMsg(`Found ${UserSpoils[regionSelected]["Spoils"][foo]["Color"]} ${UserSpoils[regionSelected]["Spoils"][foo]["Mat"]}!`,"long")
                }
                setAllInners(".spoilList",makeSpoilList())
            } else {UserSpoilWeights[regionSelected]["chanceNum"] += 1} //If the prospect failed, the numerator goes up by 1
            setAllInners(".ChanceProspect",Math.floor((UserSpoilWeights[regionSelected]["chanceNum"]/UserSpoilWeights[regionSelected]["chanceDen"]*10000))/100)
        } else {consoleMsg("Not enough $!","short")}
    } else {consoleMsg("No Spoils left to find!","short")}
}

function IncCt(thing,amt){
    if (Object.keys(UserSpoils[regionSelected]["Spoils"]).length > 0) {
        Ct[thing] += amt
        setAllInners(`.${thing}`,Ct[thing])

        if (thing=="Mine") {
            for (let i = 0; i < amt; i++) {
                const IncSpoil = GetSpoils(UserSpoils[regionSelected]["Spoils"],UserSpoilWeights[regionSelected]["Weights"])
                let mat = UserSpoils[regionSelected]["Spoils"][IncSpoil]["Mat"]
                let col = UserSpoils[regionSelected]["Spoils"][IncSpoil]["Color"]
                Ct[mat][col] += 1
                setAllInners(`.${col}${mat}`,Ct[mat][col])
            }
        }
    } else {consoleMsg("No Spoils to be found! Prospect First","long")}
}

document.getElementById('regionSelect').onchange = function() {
    //alert(`You selected: ${this.value}`)
    regionSelected = this.value
    setAllInners(".currentRegion", this.value)
    setAllInners(".spoilList",makeSpoilList())
    setAllInners(".ChanceProspect",Math.floor((UserSpoilWeights[regionSelected]["chanceNum"]/UserSpoilWeights[regionSelected]["chanceDen"]*10000))/100)

}

function GetSpoils(items, weights) {
  // 1. Calculate the total sum of all weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  
  // 2. Pick a random number between 0 and the total weight
  let random = Math.random() * totalWeight
  
  // 3. Subtract weights until the random number is <= 0
  for (let i = 0; i < Object.keys(items).length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return Object.keys(items)[i];
    }
  }
}

function BuyAThing(thing){
    if (Ct["Mine"] >= Cost[thing]) {
        IncCt(thing,1)
        Ct["Mine"] -= Cost[thing]
        setAllInners(".Mine",Ct["Mine"])

        Cost[thing] = Math.round(Cost[thing]*CostGrowthRateMiner)
        setAllInners(`.Cost${thing}`,Cost["Miner"])
    } else {consoleMsg("Not enough $!","short")}
}

function setAllInners(thingToSet,mathToDo) {
    document.querySelectorAll(thingToSet).forEach(function(i) {
        i.innerHTML = mathToDo
    })
}

let SellQty = 1
document.getElementById('sellQtySelect').onchange = function() {
    SellQty = this.value
    setAllInners(".SellingQty",SellQty)
}
function SellAThing(col,mat){
    if (SellQty == "ALL") {
        Ct["Mine"] += Price[mat][col]*Ct[mat][col]
        setAllInners(".Mine",Ct["Mine"])
        Ct[mat][col] -= Ct[mat][col]
        setAllInners(`.${col}${mat}`,Ct[mat][col])
    } else if (Ct[mat][col]>=SellQty) {
        Ct["Mine"] += Price[mat][col]*SellQty
        setAllInners(".Mine",Ct["Mine"])
        Ct[mat][col] -= SellQty
        setAllInners(`.${col}${mat}`,Ct[mat][col])
        
    } else {consoleMsg("Not enough items!","short")}
}

setInterval (() => {
    if (Ct["Miner"] > 0) {IncCt("Mine",Ct["Miner"])}
},3000)


function consoleMsg (i,decay) {
    const div = document.querySelector(".console")
    const msg = document.createElement("span")
    const checkFirstChild = div.firstChild
    msg.innerHTML = i+"<br>"
    div.insertBefore(msg,checkFirstChild)
    //div.appendChild(msg)
    let time = 0
    if (decay == "long") {
        msg.classList.add("seshUndefinedLong")
        time = 4900
    } else {
        msg.classList.add("seshUndefinedShort")
        time = 2900
    }
    timeout(msg,time)
}
const timeout = (div,time) => {
    setTimeout(() => {
        div.remove()
    }, time)
}

window.Prospect = Prospect
window.IncCt = IncCt
window.BuyAThing = BuyAThing
window.SellAThing = SellAThing