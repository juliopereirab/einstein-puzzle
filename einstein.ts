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

//npx ts-node einstein.ts

type Nationality = "Brit" | "Swede" | "Dane" | "Norwegian" | "German";
type Colour = "green" | "red" | "yellow" | "blue" | "white";
type Drink = "tea" | "water" | "milk" | "beer" | "coffee";
type Pet = "fish" | "dogs" | "birds" | "cats" | "horses";
type Cigarrette = "Pallmall" | "Prince" | "Blend" | "Bluemaster" | "Dunhill";

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


function complete(){
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
                house[k].value = l[k];
            })
        })

        //update based on identifiedRelation
        relations.forEach(r => {
            const sameValue = r.find(h => housesMatchValues(h, HouseToHouseValue(house)))

            if(sameValue && neighbours.length === 1){
                const otherValue = r.find(h => h !== sameValue);
                Object.keys(otherValue!).forEach(k => {
                    neighbours[0][k].value = otherValue![k];
                })
            }
        })

        //update values;
        Object.keys(house).filter(k => !house[k]?.value && house[k]?.cantBe?.length === 4).forEach(k => {
            const deducedValue = allValues[k].find(v => house[k]?.cantBe.indexOf(v) === -1);

            house[k].value = deducedValue;
        });
        
        const houseVal = HouseToHouseValue(house);
        if(Object.values(houseVal).filter(v => !!v).length >= 2) looseElements.unshift(houseVal);
    }
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

let loops = 0;

while(loops < 30){
    complete();
    enrichLooseElements(looseElements);
    enrichRelations(looseElements, relations);
    relateRelations(relations);
    loops++;
}

// console.log("looseElements", looseElements);
// console.log("relations", relations);
// console.log("orderedElements", JSON.stringify(orderedElements[1]));

console.log(orderedElements.map(h => JSON.stringify(h)))