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

interface Option<T>{
    value?: T;
    canBe?: T[];
    cantBe?: T[];
}

interface houseValue{
    nationality?: Nationality
    colour?: Colour
    drink?: Drink
    pet?: Pet
    cigarrette?: Cigarrette
    isCorner?: boolean;
}

interface House {
    nationality?: Option<Nationality>
    colour?: Option<Colour>
    drink?: Option<Drink>
    pet?: Option<Pet>
    cigarrette?: Option<Cigarrette>  
    isCorner?: boolean;
}


const orderedElements : House[] = [
    {nationality: {value: "Norwegian"}, isCorner: true}, 
    {colour: {value: "blue"}},
    {drink: {value: "milk"}},
    {},
    {isCorner: true}   
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
    [{nationality: "Norwegian", isCorner: true}, {colour: "blue"}, {drink: "milk"}]
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
        var neighbours = [orderedElements[i-1], orderedElements[i+1]]
        for(var keyName of keyNames.filter(k => !house[k]?.value)){
            const consideredRelations = relations.filter(r => {
                const keys = Object.keys(r.reduce((c, n) => ({...c, ...n})));
                return keys.indexOf(keyName) !== -1;
            })
            consideredRelations.forEach(r => {
                for(var suggestion of r){
                    if(!housesMatch(HouseToHouseValue(house), suggestion) && !neighbours.some(n => !!n && housesMatch(HouseToHouseValue(n), suggestion))){
                       if(!house[keyName]?.canBe) house[keyName] = {canBe: []};
                       house[keyName].canBe.push(suggestion[keyName])
                    } else {
                        if(!house[keyName]?.cantBe) house[keyName] = {cantBe: []};
                        house[keyName].cantBe.push(suggestion[keyName]);
                    }
                }
            })
        }
    }
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

            // if()

            for(var h1=0; h1 < relation.length; h1++){
                for(var h2=0; h2 < comparison.length; h2++){
                    if(housesAreRelated(relation[h1], comparison[h2])){
                       const merged = {...relation[h1], ...comparison[h2]} 
                       relation[h1] = merged;
                       comparison[h2] = merged;
                    }
                    // let mainHouse = relation[h1];
                    // let neighBours = relation.filter(h => h !== mainHouse);
                    // for(var k of keyNames){
                    // }
                }
            }
        }
    }
}

const housesDontMatch = (h1: houseValue, h2: houseValue) => {
    const fields = Object.keys({...h1, ...h2});

    return fields.some(t => h1[t] && h2[t] && h1[t] !== h2[t])
}

// function positionIsDiscarded(r1: houseValue[], r2:houseValue[]){

//     for(var i=0; i < r1.length; i++){
//         if(r1[i] && r2[i] && housesDontMatch(r1[i], r2[i])) return true;
//     }

//     return false;
// }

// function compareRelations(r1: houseValue[], r2:houseValue[]){
//     const base = r1.length > r2.length ? r1 : r2;
//     const comparison = base === r1 ? r2 : r1;

//     // for(var i=0; i< base.length; i++){
//     //     if()
//     // }

// }

let loops = 0;

// console.log(HouseToHouseValue(orderedElements[3]))

while(loops < 30){
    enrichLooseElements(looseElements);
    enrichRelations(looseElements, relations);
    relateRelations(relations);
    complete();
    loops++;
}

console.log("looseElements", looseElements);
console.log("relations", relations);
console.log("orderedElements", JSON.stringify(orderedElements[0]));


