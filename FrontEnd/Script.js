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


var LOGGED_IN = (window.localStorage.getItem("USER_TOKEN")==null) ? false : true;

var CACHE = [];   //{Name:"", Type:""}
var USER_CACHE = []; //{Name:"", Type:""}
var LOCATION;

$(document).ready( () => {
    createListeners()
    // Establish User DB to save overhaul later
    DO_AJAX('get', "/api/get_user_db", {}, (res) =>{
        console.log("API 'get' succeeded");
        USER_CACHE = res;
    })
} )


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

    const home_page = $("a.nav_home");
    home_page.click( getHome );
    const user_page = $("a.nav_user");
    user_page.click( getUser );
    
    
    nav_bar();

    console.log("User action set")
}

function open_modal(isSignup){
    
    const container = $("div.container-display")
    container.empty()    // Empty the Cache and Display Container
    const verb = (isSignup) ? "Sign Up" : "Log In";
    container.append([
        $('<div/>', {class: "brewery-card", id: "login_modal" } ).append(  [
            $('<form/>', { onsubmit: "return false;", class:"submit_search_form", html: `
            <h3 class="list-inline-item">${verb}</h3>
            <span>Username?</span>
            <input placeholder="Try to be unique, okay?" type="text" class='user_input' name="login_username" pattern="^(.{5,80}){1}$" title="At least 5 characters">
            <span>Password?</span>
            <input placeholder="Make it secured" type="password" class='user_input' name="login_password" pattern="^(.{5,80}){1}$" title="At least 5 characters">
            <input type="submit" value='${verb}' class="submit_action" id="login_submit">
            `}
            )
        ])     // Card Closer
    ])
    const modal_page = $("input#login_submit")
    const action = (isSignup==true) ? ()=>log_in(true) : ()=>log_in(false) 
    modal_page.click( action )

}

function log_in(isSignup){
    // Get DB ID. Set in storage
    // If not, revoke
    console.log("Creating user session...")
    const inp_vals = getInputs(  $("#login_modal .user_input"))    // {login_username: "name", login_password: "password"}
    const vals_only = Object.values(inp_vals) 
    const anyInvalid = vals_only.some ( (item)=>{ return item.length<5 }) 
    if( !anyInvalid ){
        // All inputs are valid, proceeding...
        // Now post inputs to get database ID
        const credentials = {
            username: inp_vals.login_username,
            hash:  CryptoJS.MD5( inp_vals.login_password ).toString()
        }
        console.log( "CRED: ", credentials )

        if(isSignup){
            console.log("Signing up...")
            DO_AJAX('post', '/api/signup_user', credentials, (resp)=>{
                console.log("POST SIGNUP RESP is: ", resp)
                alert( (resp.status=="created") ? "Account created. Please login." : "Could not create account.")
                open_modal(false);
            })
        }
        else{
            console.log("Loggin in...")
            DO_AJAX('get', '/api/get_db_id', credentials, (resp)=>{
                // Add to local storage
                console.log("GET DB ID RESP is: ", resp)
                if(resp.status=="success"){
                    window.localStorage.setItem("USER_TOKEN", resp.db_id)
                    LOGGED_IN = true
                    nav_bar()
                }
                alert( (LOGGED_IN) ? `Welcome, ${credentials.username}` : "Sorry, couldn't find your account." )
            })
        }

    }
    else{
        alert("Invalid Entry")
    }
}

function nav_bar(){
    const logged_out = `
    <h3 class="list-inline-item"><a class="nav_login" href="#"> Login</a></h3>
    <h3 class="list-inline-item"><a class="nav_signup" href="#"> Signup</a></h3>
    `
    const logged_in = `
    <h3 class="list-inline-item"><a class="nav_signout" href="#"> Signout</a></h3>
    `
    const parent = $(".container-header ul.list-inline-container")
    parent.append( (LOGGED_IN) ? logged_in : logged_out )
    if(LOGGED_IN){
        $("h3 .nav_signup").parent().remove()
        $("h3 .nav_login").parent().remove()

        $("a.nav_signout").click( ()=>{
            window.localStorage.setItem("USER_TOKEN", null)
            alert("SIGNED OUT SUCCES")
        } );
    }
    else{
        $("h3 .nav_signout").parent().remove()

        $("a.nav_login").click( ()=>open_modal(false) );
        $("a.nav_signup").click( ()=>open_modal(true) );
    }
    

}
function  start_here(search=false){
    
    if( search ){
        const input_map = getInputs()
        const URL = getURL( input_map )
        console.log(URL)
        const API_Results = DO_AJAX('get', URL, {}, (response) =>{ 
            const results = response.Similar.Results
            CACHE = [...results]    // results = Array of Objects [ {}, {} ]
            parseEntries( results ) 
        })
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

function parseEntries(raw_json){
    console.log("Candy? \n",  raw_json)
    let response = [ ...raw_json ]
    if(response.length<1){
        alert("No matches found for that query. \nPlease try another search")
        return
    }
    else{
        const container = $("div.container-display")
        container.empty()    // Empty the Cache and Display Container
        var isEmpty = true

        const user_items =  USER_CACHE.map( (user_likes)=>{return(user_likes.Name)} ) ;
        for(let item of response){
            setTimeout( () => {
                const nothing = response.shift()
                item['Star'] = user_items.indexOf(item.Name) >= 0  ;   // item object now has 3 entries
                let ret = makeEntry(item, container); 
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
    //console.log("OBJECT IS: ", obj)
    // Takes an entry from a $.get response and create a card with the data
    // Defaults to appending to the Display container
    const template = {Name:"", Type:"", Star:false, ...obj}    // Destructure to overwrite new values
    if(template.Name.length<1){return false}
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
    const image_url = (template.Star) ? './Images/starred.png' : './Images/unstarred.png' ;
    parent.append([
        $('<div/>', {class: "brewery-card" } ).append(  [ 
            $('<div/>', {class: "brewery-card-left"} ).append([    
                $('<div/>', {class: "details", text:template.Name, id:template.id  }),       // Header for top of entry
                $("<br>"),  
                $('<div/>', {class: "details", text:`| Type: ${template.Type}`})    // Span for displaying additional content
            ]),
            $('<div/>', {class: "brewery-card-right"} ).append([ 
                $('<div/>', {class:'details-right', html:`<img src="${image_url}">`, onclick:`handleClick(event, ${JSON.stringify(obj)} )`})       // Header for top of entry
            ])
        ]),  // Closer for div element

    ])  // Closer for parent object
}

function getHome(){
    const container = $("div.container-display")
    container.empty()
    if(CACHE.length===0){
        alert("Try starting with a basic search.")
    }
    else{
        parseEntries(CACHE)
    }
}

function getUser(){
    // AJAX Call to server.
    // Then parses results 
    // and passes to make entry elements
    DO_AJAX('get', "/api/get_user_db", {}, (res) =>{
        console.log("API 'get' succeeded");
        const converted = res.map((item)=>{return {Name:item.item_name, Type:item.item_type}})
        USER_CACHE = converted;
        parseEntries(converted);
    })
}

function parseEntriesOLD(json_data){
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
    const remove_item = (item_id) => {
        const user_stuff = {item_id:item_id}
        DO_AJAX('delete', '/api/delete_item', user_stuff, (resp)=>{
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
    let temp = window.localStorage.getItem("USER_TOKEN");
    if(temp===null){
        temp = "demo_user"
        window.localStorage.setItem("USER_TOKEN", temp);
        alert("You're currently not signed in. \nPlease sign in to save your list. ")
    }
    console.log(JSON.stringify({...json_data, ...{'USER_TOKEN':temp} }) )
    $.ajax({ 
        type:method,
        url: url,
        data:  {...json_data, ...{'USER_TOKEN':temp} } , 
        contentType: 'application/json',
        success: (res) => {callBack(res)},
        error: function(error){
            console.log(error)
            alert(`Error. Can't ${method.toUpperCase() } that right now.`)
        }
    }); 
}
