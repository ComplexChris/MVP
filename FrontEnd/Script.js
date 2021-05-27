// Create a Dropzone object
// Capture path and store data of file locally


// Use Pantry ( https://getpantry.cloud/apiv1/pantry/809cff74-8863-45df-a7b8-44641613bcf8/basket/testBasket )
// Use that to create and store variables from GoFile

// Submit another Post request to Pantry with update object
// {fileName:[path, apiKey, ID]}

/*
$(document).ready(function(){
    $("form").submit(function(e){
        
        const inst =  new Breweries}
        e.preventDefault()
    });
}); */

const __version__ = "5.3.7"
console.log(__version__)

var CACHE = [];   //{Name:"", Type:""}
var USER_CACHE = []; //{Name:"", Type:""}
var LOCATION;

$(document).ready( () => {
    createListeners()
    invokeCORS()
    // Establish User DB to save overhaul later
    DO_AJAX('get', "/api/get_user_db", {}, (res) =>{
        console.log("API 'get' succeeded");
        USER_CACHE = res;
    })
} )

// function invokeCORS(){
//     const token = `489367e738051a270dc7ea09c494a6764b81a5f6cb21b37ec0fafa142ddaa871`
//     const url = `https://cors-anywhere.herokuapp.com/corsdemo?accessRequest=${token}`
//     GET_AJAX(url, (res)=>{
//         console.log("CORS response: ", res)
//     })
// }
function Callback(e){
    // Primary callback for submitting user input
    // Will invoke external API
    console.log(e)
    if( e.submitter.value==="Reset" ){
        const inp_els = $(".field .user_input")
        inp_els.each( function(index, element){
            element.value = ""
        })
    }
    else{
        var inst = start_here(true)
    }
    e.preventDefault()
    return false;
}

function createListeners(){
    console.log("DTGHDGH")
    $(".user_input").keyup( function(e){
        if(e.key==="enter"){
            console.log("Button pressed")
            $(".submit_action").click()
            return false;
        }
        else{
            console.log("Else")
        }
    } )

    const user_page = $("a.nav_user");
    user_page.click( getUser );

    const home_page = $("a.nav_home");
    home_page.click( getHome );

    console.log("User action set")
}


function  start_here(search=false){
    
    if( search ){
        const input_map = getInputs()
        const URL = getURL( input_map )
        console.log(URL)
        const API_Results = invokeGet( URL )
        console.log("URL: " + URL)
        //this.Final = this.
    }
}

function getInputs( elements_path=".field .user_input" ){ // elements_path="input.user_input", extra="" ){
        // Gets data from all input fields
        // $("form.submit_search_form input.user_input")
    const inp_els = $(elements_path)
    
    const input_map = {}
    inp_els.each( function(index, element){
        const key = element.name
        const val = element.value
        input_map[key] = val
    })
    return(input_map);
}

function getURL(input_map){
    // Iterates over an object and appends key-value pairs to API URL if valid argument
    //const apiURL = "https://cors-anywhere.herokuapp.com/http://api.openbrewerydb.org/breweries?"
    //const apiURL = "https://api.openbrewerydb.org/breweries?per_page=75&"
    const cors = 'https://cors-anywhere.herokuapp.com/'
    const apiURL = `https://tastedive.com/api/similar?k=414580-API-GZ2B02NL&q=${input_map.by_name}`
    return cors+apiURL;

    let newURL = apiURL
    for(let key in input_map){
        if( parameters.includes(key) && input_map[key]!==undefined ){
            let val = input_map[key].replace(" ","%20")
            newURL += `${key}=${val}&`
        }
        else{
            console.log(`${key}=${input_map[key]} - was not a valid key`)
        }
    }
    return(newURL);
}
function invokeGet(URL){
    $.get(URL, (data) => {parseGet(data)} )
}
function parseGet(raw){
    console.log("Candy? \n",  raw)
    let parsed = raw //JSON.parse( raw )
    let response = parsed.Similar.Results
    if(response.length<1){
        alert("No matches found for that query. \nPlease try another search")
        return
    }
    else{
        const container = $("div.container-display")
        container.empty()    // Empty the Cache and Display Container
        CACHE = []
        var isEmpty = true
        for(let item of response){
            setTimeout( () => {
                const nothing = response.shift()
                CACHE.push(item);
                let ret = makeEntry(item, container) 
                if(ret!==false){ isEmpty=false } 
                if(response.length==0 & isEmpty){
                    alert("No matches found for that query. \nMaybe adjust the Entertainment Type?");
                }
            } ,
            200)
        }
        $(".container-display").css("text-shadow", " inset 15px 14px 2px maroon" )
        
    }
}

function makeEntry(obj, parent){
    console.log("OBJECT IS: ", obj)
    // Takes an entry from a $.get response and create a card with the data
    // Defaults to appending to the Display container
    const template = {Name:"", Type:"", ...obj}
    if(template.Name.length<1){return false}
    console.log("TYPE: ", template.Type)
    const dropDown = $('select.user_input')[0].value.toLowerCase()
    if( dropDown!=="" ){
        if(dropDown!==template.Type){return false}
    }
    /*
    for(let item in obj){
        if(item in template && obj[item] !== null){
            template[item] = obj[item]
        }
    }   */
    // Uses standard structure for displaying elements
    //const $header = $('<div/>', {class: "title", text=template.name})
    parent.append([
        $('<div/>', {class: "brewery-card" } ).append(  [ 
            $('<div/>', {class: "brewery-card-left"} ).append([    
                $('<div/>', {class: "details", text:template.Name, id:template.id  }),       // Header for top of entry
                $("<br>"),  
                $('<div/>', {class: "details", text:`| Type: ${template.Type}`})    // Span for displaying additional content
            ]),
            $('<div/>', {class: "brewery-card-right"} ).append([ 
                $('<button/>', {class:'details-right', html:'<img src="./Images/unstarred.png">', onclick:`handleClick(event, ${JSON.stringify(obj)} )`})       // Header for top of entry
            ])
        ]),  // Closer for div element

    ])  // Closer for parent object
}

function getHome(){
    const container = $("div.container-display")
    container.empty()
    for(item of CACHE){
        console.log("Passing Item for Home: ", item)
        makeEntry(item, container);
    }
}

function getUser(){
    // AJAX Call to server.
    // Then parses results 
    // and passes to make entry elements
    DO_AJAX('get', "/api/get_user_db", {}, (res) =>{
        console.log("API 'get' succeeded");
        parseEntries(res);
    })
}

function parseEntries(json_data){
    console.log("User data is: ", json_data)
    const container = $("div.container-display")
    container.empty()
    let isEmpty = true
    for(item of json_data){
        const nothing = json_data.shift()
        console.log("Passing Item: ", item)
        const obj = {Name: item.item_name, Type: item.item_type}
        let ret = makeEntry(item, container) 
        if(ret!==false){isEmpty = false} 
        if(json_data.length==0 & isEmpty){
            alert("No matches found for that query. \nMaybe adjust the Entertainment Type?");
        }
    }
    if(isEmpty) {alert("Sorry, couldn't find any items in your favorites that match that Entertainment Type.")}
}


function handleClickOld(e, obj){
    //alert("You clicked: ", obj)
    console.log("Raw obj: ", obj) //inst.CACHE[name] )
    // Do get request. If already liked, invoke delete request
    // Else, add to databases
    const create = () =>{
        $.post({
            url: "/api/save_entry",
            data: JSON.stringify( obj ),
            contentType: "application/json",
            success: function(resultData) { alert("Save Complete") }
        });
    }
    const remove = () => {

    }

    // Test if entry exists



    //saveData.error(function() { alert("Something went wrong"); });
}

var global;
function handleClick(event, obj){
    // Click event for when an item card is clicked.
    // obj //{Name:"", Type:""}
    

    // Do get request. If already liked, invoke delete request
    // Else, add to databases
    
    const add_item = (item_id) =>{
        // Makes POST requests to add item to table, and returns ID of item
        const date_str = new Date().toGMTString()
        const user_stuff = {item_id:item_id, add_date:date_str}
        DO_AJAX('post', '/api/add_to_user', user_stuff, (resp)=>{
            alert( (resp.status==='added') ? "Added to likes" : "Couldn't add to likes")
        })
    }
    const remove_item = () => {
        const user_stuff = {item_id:item_id}
        DO_AJAX('delete', '/api/add_to_user', user_stuff, (resp)=>{
            alert( (resp.status==='removed') ? "Removed from likes" : "Couldn't add to likes")
        })
    }
    // USER_CACHE.forEach( (item)=>{if(item==sub){n=-1} } ) 
    //const index = USER_CACHE.indexOf(obj)
    let index = -1;
    for(item in USER_CACHE){
        if( USER_CACHE[item].Name == obj.Name ){
            index=item;
            break
        }
        console.log(item)
    }
    event.path[0].setAttribute('src', index<0 ? "/Images/starred.png" : "/Images/unstarred.png"  );

    DO_AJAX('post', '/api/add_item', obj, (item_id)=>{
        if( index < 0 ){
            USER_CACHE.push(obj)
            add_item(item_id);
        }
        else{
            USER_CACHE.splice( index, 1 );
            remove_item(item_id);
        }
    } )
    // Test if entry exists
}


function DO_AJAX(method, url, json_data, callBack){
    // ('method', '/api/test', {key:value}, ()=>{} )
    $.ajax({ 
        type:method,
        url: url,
        data: JSON.stringify( json_data ), 
        contentType: 'application/json',
        success: (res) => {callBack(res)},
        error: function(error){
            console.log(error)
            alert("Error. Can't POST that right now.")
        }
    }); 
}
