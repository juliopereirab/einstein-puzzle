// nationalities: Brit, Swede, Dane, Norwegian, German
// colours: green, red, yellow, blue, white
// drinks: tea, water, milk, beer, coffee
// pets: fish, dogs, birds, cats, horses
// cigarrettes: Pallmall, Prince, Blend, bluemaster, Dunhill
// position: 1, 2, 3, 4, 5


// The Brit lives in the red houseValue
// The Swede keeps dogs as pets
// The Dane drinks tea
// The green houseValue is on the left of the white houseValue
// The green house’s owner drinks coffee
// The person who smokes Pall Mall rears birds
// The owner of the yellow houseValue smokes Dunhill
// The man living in the center houseValue drinks milk
// The Norwegian lives in the first houseValue
// The man who smokes Blends lives next to the one who keeps cats
// The man who keeps horses lives next to the man who smokes Dunhill
// The owner who smokes BlueMaster drinks beer
// The German smokes Prince
// The Norwegian lives next to the blue houseValue
// The man who smokes Blend has a neighbor who drinks water

// The question is, who owns the fish?

const { serialize, deserialize } = require("v8")

type Nationality = "Brit" | "Swede" | "Dane" | "Norwegian" | "German";
type Colour = "green" | "red" | "yellow" | "blue" | "white";
type Drink = "tea" | "water" | "milk" | "beer" | "coffee";
type Pet = "fish" | "dogs" | "birds" | "cats" | "horses";
type Cigarrette = "Pallmall" | "Prince" | "Blend" | "Bluemaster" | "Dunhill";


(Array.prototype as any).distinct = function(){
    return this.filter((value: any, index: number, self: any[]) => self.indexOf(value) === index);
}

const allValues = {
    nationality: ["Brit", "Swede", "Dane", "Norwegian", "German"],
    colour: ["green","red","yellow","blue","white"],
    drink: ["tea","water","milk","beer","coffee"],
    pet: ["fish","dogs","birds","cats","horses"],
    cigarrette: ["Pallmall","Prince","Blend","Bluemaster","Dunhill"]
}

interface IOption<T>{
    value?: T;
    cantBe?: T[];
}

class OptionValue<T> implements IOption<T>{
    cantBe = [];
    value;

    constructor(v?: T){
        this.value = v;
    }
}

class House{
    nationality?: IOption<Nationality>
    colour?: IOption<Colour>
    drink?: IOption<Drink>
    pet?: IOption<Pet>
    cigarrette?: IOption<Cigarrette>  

    constructor(house: houseValue){
        this.nationality = new OptionValue(house.nationality);
        this.colour = new OptionValue(house.colour);
        this.drink = new OptionValue(house.drink);
        this.pet = new OptionValue(house.pet);
        this.cigarrette = new OptionValue(house.cigarrette);        
    }
}

interface houseValue{
    nationality?: Nationality
    colour?: Colour
    drink?: Drink
    pet?: Pet
    cigarrette?: Cigarrette
}

interface House {
    nationality?: IOption<Nationality>
    colour?: IOption<Colour>
    drink?: IOption<Drink>
    pet?: IOption<Pet>
    cigarrette?: IOption<Cigarrette>  
}


const orderedElements : House[] = [
    new House({nationality: "Norwegian"}), 
    new House({colour: "blue"}),
    new House({drink:  "milk"}),
    new House({}),
    new House({})
] 

const keyNames = ["nationality", "colour", "cigarrette", "drink", "pet"]

const looseElements : houseValue[] = [
    {nationality: "Brit", colour: "red"},
    {nationality: "Swede", pet: "dogs"},
    {nationality: "Dane", drink: "tea"},
    {colour: 'green', drink: "coffee"},
    {cigarrette: "Pallmall", pet: "birds"},
    {colour: "yellow", cigarrette: "Dunhill"},
    {cigarrette: "Bluemaster", drink: "beer"},
    {nationality: "German", cigarrette: "Prince"}
]

const relations : houseValue[][] = [
    [{colour: "green"},{colour: "white"}],
    [{pet: 'cats'},{cigarrette: "Blend"}],
    [{cigarrette: "Dunhill"},{pet: "horses"}], 
    [{cigarrette: "Blend"},{drink: 'water'}], 
    [{nationality: "Norwegian"}, {colour: "blue"}, {drink: "milk"}]
];

function HouseToHouseValue(house: House){
    const values = (Object.entries(house)).map(([k, v]) => ({[k]: v.value}))
    return values.length > 0
        ? values.reduce((c, n) => ({...c, ...n})) as houseValue
        : {};
}


function complete(orderedElements : House[], looseElements : houseValue[], relations : houseValue[][]){
    let didUpdate = false;

    const currentValues = orderedElements.map(h => Object.values(HouseToHouseValue(h)))
        .reduce((c, n) => [...c, ...n]);
    
    for(var i=0; i<orderedElements.length; i++){
        var house = orderedElements[i];
        const neighbours = [orderedElements[i-1], orderedElements[i+1]].filter(el => !!el);

        for(var keyName of keyNames.filter(k => !house[k]?.value)){
            const consideredRelations = relations.filter(r => {
                const keys = Object.keys(r.reduce((c, n) => ({...c, ...n})));
                return keys.indexOf(keyName) !== -1;
            })
            
            //update based on relations
            consideredRelations.forEach(r => {                
                if(neighbours.map(h => HouseToHouseValue(h)).every(n => r.every(h => housesDontMatch(n, h)))){
                    updateCantBe(r.map(h => h[keyName]).filter(el => !!el), house, keyName);
                }
            }); 

            //update based on looseValues
            looseElements.filter(l => !!l[keyName]).forEach(l => {
                if(housesDontMatch(l, HouseToHouseValue(house))){
                    updateCantBe([l[keyName]], house, keyName);
                }
            });


            const distinctValuesSoFar = orderedElements
                .map(h => h[keyName].cantBe).reduce((c, n) => [...c, ...n])
                .filter(v => currentValues.indexOf(v) === -1);

            const uniqueCantBes = distinctValuesSoFar
                .distinct();

            uniqueCantBes
                .forEach((v: string) => {
                    if(distinctValuesSoFar.filter(val => val === v).length === 4){
                        const shouldBeHouse = orderedElements.find(h => h[keyName].cantBe.indexOf(v) === -1);
                        if(shouldBeHouse){
                            shouldBeHouse[keyName].value = v;
                            didUpdate = true;
                        }
                    }
                })
        }

        //disperse every value
        Object.keys(house).filter(k => !!house[k].value).forEach(k => {
            const allOtherHouses = orderedElements.filter(h => h !== house);

            allOtherHouses.forEach(h => {
                updateCantBe([house[k].value], h, k);
            })
        }); 

        //update values based on same elements in looseElements
        looseElements.filter(l => housesMatchValues(l, HouseToHouseValue(house))).forEach(l => {
            Object.keys(l).forEach(k => {
                if(!house[k].value){
                    house[k].value = l[k];
                    didUpdate = true;
                }
            })
        })

        //update based on identifiedRelation
        relations.forEach(r => {
            const sameValue = r.find(h => housesMatchValues(h, HouseToHouseValue(house)))

            if(sameValue && neighbours.length === 1){
                const otherValue = r.find(h => h !== sameValue);
                if(otherValue){
                    Object.keys(otherValue).forEach(k => {
                        neighbours[0][k].value = otherValue![k];
                        didUpdate = true;
                    })
                }
            }
        })

        //update values;
        Object.keys(house).filter(k => !house[k]?.value && house[k]?.cantBe?.length === 4).forEach(k => {
            const deducedValue = allValues[k].find(v => house[k]?.cantBe.indexOf(v) === -1);

            if(!house[k].value){
                house[k].value = deducedValue;
                didUpdate = true;
            }
        });
        
        const houseVal = HouseToHouseValue(house);
        if(Object.values(houseVal).filter(v => !!v).length >= 2) looseElements.unshift(houseVal);
    }

    return didUpdate;
}

function housesMatchValues(h1: houseValue, h2: houseValue){
    const values = Object.values(h1).filter(val => !!val);
    const houseValues = Object.values(h2).filter(val => !!val);

    return values.some(val => houseValues.indexOf(val) !== -1)
}

function updateCantBe(values: any[], house: House, keyName: string){
    const s = new Set(house[keyName].cantBe)

    values.forEach(v => {
        s.add(v);
    })
    house[keyName].cantBe = [...s];
}

function enrichLooseElements(looseElements: houseValue[]){
    for(var i=0; i < looseElements.length; i++){
        let el = looseElements[i];
        for(var ii = looseElements.indexOf(el)+1; ii < looseElements.length; ii++){
            const comparison = looseElements[ii];

            if (housesMatch(el, comparison)){
                looseElements[i] = {...el, ...comparison};
                i++;
                looseElements.splice(ii, 1);
            }
        }
    }
}

function housesAreRelated(h1: houseValue, h2: houseValue){
    return Object.values(h1).some(v => Object.values(h2).indexOf(v) !== -1);
}

function enrichRelations(looseElements: houseValue[], relations: houseValue[][]){
    const mappedElements = looseElements.map(el => ({[Object.values(el).join(",")]: el}))
        .reduce((c, n) => ({...c, ...n}));

    for(var i=0; i < relations.length; i++){
        const relation = relations[i];
        for(var ii=0; ii < relation.length; ii++){
            const element = relations[i][ii];
            for(var k of Object.keys(mappedElements))
            {
                if(Object.values(element).some(v => k.includes(v))){
                    const merge = {...element, ...mappedElements[k]}
                    relations[i][ii] = merge;
                    mappedElements[k] = merge;
                }
            }

        }
        enrichLooseElements(relation);
    }
}

function housesMatch(h1: houseValue, h2: houseValue){
    return Object.values(h1).some(v => Object.values(h2).indexOf(v) !== -1);
}

function relateRelations(relations: houseValue[][]){
    for(var i=0; i < relations.length; i++){
        const relation = relations[i];
        for(var ii = relations.indexOf(relation)+1; ii < relations.length; ii++){
            const comparison = relations[ii];

            for(var h1=0; h1 < relation.length; h1++){
                for(var h2=0; h2 < comparison.length; h2++){
                    if(housesAreRelated(relation[h1], comparison[h2])){
                       const merged = {...relation[h1], ...comparison[h2]} 
                       relation[h1] = merged;
                       comparison[h2] = merged;
                    }
                }
            }
        }
    }
}

const housesDontMatch = (h1: houseValue, h2: houseValue) => {
    const fields = Object.keys({...h1, ...h2});

    return fields.some(t => h1[t] && h2[t] && h1[t] !== h2[t])
}

const deepCopy = (ob: any) => deserialize(serialize(ob));

function checkAndApplyHipothesis(){

    const values = keyNames
        .map(keyName => ({[keyName]: orderedElements.map(h => h[keyName].value)}))
        .sort((kv1, kv2) => {
            const amount1 = Object.values(kv2)[0].filter(el => !!el).length;
            const amount2 = Object.values(kv1)[0].filter(el => !!el).length;
            return amount1 - amount2;
        })
    const key = Object.keys(values[0])[0];
    // const val = allValues[key].filter(v => values[0][key].indexOf(v) === -1)[0]
    const subjectHouses = orderedElements.map(h => !h[key].value ? h : undefined);
    let selectedIndex : number | undefined;
    let selectedValue : string | undefined;

    allValues[key].filter(v => values[0][key].indexOf(v) === -1).forEach(val => {
        for(let i=0; i<orderedElements.length; i++){
            if(!subjectHouses[i]) continue;
    
            const orderedElementsCopy : House[] = deepCopy(orderedElements);
            const looseElementsCopy : houseValue[] = deepCopy(looseElements);
            const relationsCopy : houseValue[][] = deepCopy(relations);    
    
            orderedElementsCopy[i][key].value = val
    
            let loops = 0;
            while(loops < 10){
                enrichLooseElements(looseElementsCopy);
                enrichRelations(looseElementsCopy, relationsCopy);
                relateRelations(relationsCopy);
                complete(orderedElementsCopy, looseElementsCopy, relationsCopy);
                loops++;
            }
    
            if(orderedElementsCopy.every(h => Object.values(h).every(v => v.cantBe.length < 5 && v.cantBe.indexOf(v.value) === -1))){
                selectedIndex = i;
                selectedValue = val;
                break;
            }
        }
    })

    if(selectedIndex !== undefined){
        orderedElements[selectedIndex][key].value = selectedValue;
    }
}

let loops = 0;

while(loops < 30){
    enrichLooseElements(looseElements);
    enrichRelations(looseElements, relations);
    relateRelations(relations);
    complete(orderedElements, looseElements, relations);
    if(loops > 20) checkAndApplyHipothesis();
    loops++;
}

// console.log("looseElements", looseElements);
// console.log("relations", relations);
// console.log("orderedElements", JSON.stringify(orderedElements[4]));

// console.log(orderedElements.map(h => JSON.stringify(h)))

keyNames.forEach(keyName => {
    console.log("___________________________________________________")
    console.log(`${keyName} | ${orderedElements.map(h => h[keyName].value).join(" | ")}`)
})