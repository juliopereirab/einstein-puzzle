// nationalities: Brit, Swede, Dane, Norwegian, German
// colours: green, red, yellow, blue, white
// drinks: tea, water, milk, beer, coffee
// pets: fish, dogs, birds, cats, horses
// cigarrettes: Pallmall, Prince, Blend, bluemaster, Dunhill
// position: 1, 2, 3, 4, 5


// The Brit lives in the red house
// The Swede keeps dogs as pets
// The Dane drinks tea
// The green house is on the left of the white house
// The green house’s owner drinks coffee
// The person who smokes Pall Mall rears birds
// The owner of the yellow house smokes Dunhill
// The man living in the center house drinks milk
// The Norwegian lives in the first house
// The man who smokes Blends lives next to the one who keeps cats
// The man who keeps horses lives next to the man who smokes Dunhill
// The owner who smokes BlueMaster drinks beer
// The German smokes Prince
// The Norwegian lives next to the blue house
// The man who smokes Blend has a neighbor who drinks water

// The question is, who owns the fish?

//npx ts-node einstein.ts


interface house {
    nationality?: "Brit" | "Swede" | "Dane" | "Norwegian" | "German";
    colour?: "green" | "red" | "yellow" | "blue" | "white";
    drink?: "tea" | "water" | "milk" | "beer" | "coffee";
    pet?: "fish" | "dogs" | "birds" | "cats" | "horses";
    cigarrette?: "Pallmall" | "Prince" | "Blend" | "Bluemaster" | "Dunhill";    
    isCorner?: boolean;
}


// const orderedElements = [
//     {nationality: "Norwegian"}, 
//     {colour: "blue"},
//     {drink: "milk"},
//     undefined,
//     undefined   
// ] as (house | undefined)[]

const keyNames = ["nationality", "colour", "cigarrette", "drink", "pet"]

const looseElements : house[] = [
    {nationality: "Brit", colour: "red"},
    {nationality: "Swede", pet: "dogs"},
    {nationality: "Dane", drink: "tea"},
    {colour: 'green', drink: "coffee"},
    {cigarrette: "Pallmall", pet: "birds"},
    {colour: "yellow", cigarrette: "Dunhill"},
    {cigarrette: "Bluemaster", drink: "beer"},
    {nationality: "German", cigarrette: "Prince"}
]

const relations : house[][] = [
    [{colour: "green"},{colour: "white"}],
    [{pet: 'cats'},{cigarrette: "Blend"}],
    [{cigarrette: "Dunhill"},{pet: "horses"}], 
    [{cigarrette: "Blend"},{drink: 'water'}], 
    [{nationality: "Norwegian", isCorner: true}, {colour: "blue"}, {drink: "milk"}]
];

function enrichLooseElements(looseElements: house[]){
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

function housesAreRelated(h1: house, h2: house){
    return Object.values(h1).some(v => Object.values(h2).indexOf(v) !== -1);
}

function enrichRelations(looseElements: house[], relations: house[][]){
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

function housesMatch(h1: house, h2: house){
    return Object.values(h1).some(v => Object.values(h2).indexOf(v) !== -1);
}

function relateRelations(relations: house[][]){
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

                    let mainHouse = relation[h1];
                    let neighBours = relation.filter(h => h !== mainHouse);

                    for(var k of keyNames){
                        
                    }
                }
            }
        }
    }
}

const housesDontMatch = (h1: house, h2: house) => {
    const fields = Object.keys({...h1, ...h2});

    return fields.some(t => h1[t] && h2[t] && h1[t] !== h2[t])
}

function positionIsDiscarded(r1: house[], r2:house[]){

    for(var i=0; i < r1.length; i++){
        if(r1[i] && r2[i] && housesDontMatch(r1[i], r2[i])) return true;
    }

    return false;
}

function compareRelations(r1: house[], r2:house[]){
    const base = r1.length > r2.length ? r1 : r2;
    const comparison = base === r1 ? r2 : r1;

    // for(var i=0; i< base.length; i++){
    //     if()
    // }

}

let loops = 0;

while(loops < 30){
    enrichLooseElements(looseElements);
    enrichRelations(looseElements, relations);
    relateRelations(relations);
    loops++;
}

console.log("looseElements", looseElements);
console.log("relations", relations);



