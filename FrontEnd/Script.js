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

const __version__ = "2.3.7"
console.log(__version__)

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
        var inst = new Yolo(true)
    }
    e.preventDefault()
}

//$(".field .user_input").on("submit")
// Can also do $(submit_form)

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


class Yolo{
    constructor(search=false){
        this.CACHE = {}
        if( search ){
            this.input_map = this.getInputs()
            this.URL = this.getURL( this.input_map )
            console.log(this.URL)
            this.API_Results = this.invokeGet( this.URL )
            console.log("URL: " + this.URL)
            //this.Final = this.
        }
    }

    getInputs( elements_path=".field .user_input" ){ // elements_path="input.user_input", extra="" ){
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

    getURL(input_map){
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

    invokeGet(URL){
        $.get(URL, (data) => {this.parseGet(data)} )
    }
    parseGet(raw){
        console.log("Candy? \n",  raw)
        let parsed = raw //JSON.parse( raw )
        let response = parsed.Similar.Results
        if(response.length<1){
            alert("No matches found for that query. \nPlease try another search")
            return
        }
        else{
            const container = $("div.container-display")
            container.empty()
            for(let item of response){
                setTimeout( () => {
                    this.CACHE[item.name] = item
                    this.makeEntry(item, container) } ,
                200)
            }
            $(".container-display").css("text-shadow", " inset 15px 14px 2px maroon" )
        }
    }

    makeEntry(obj, parent){
        console.log("OBJECT IS: ", obj)
        // Takes an entry from a $.get response and create a card with the data
        // Defaults to appending to the Display container
        const template = {Name:"", Type:"", ...obj}

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

    getUser(what){
        // AJAX Call to server.
        // Then parses results 
        // and passes to make entry elements
        $.ajax({ 
            type:"GET",
            url:"/api/get_user_db",
            data: JSON.stringify(what), 
            contentType: 'application/json',
            success: function(res) {
                console.log("API 'get' succeeded");
                this.parseUser(res);
            },
            error: function(error){
                console.log('An error has occured: ', error)
            }
        }); 

    }

    parseUser(json_data){
        console.log("User data is: ", json_data)
        for(item in json_data){
            console.log("Passing Item: ", item)
            this.makeEntry(item);
        }
    }

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
function handleClick(e, obj){
    global = e;
    var dataaa = obj //{"text":"This is my first post!"}
    

    // Do get request. If already liked, invoke delete request
    // Else, add to databases
    const create = () =>{
        $.ajax({ 
            type:"POST",
            url:"/api/add_like",
            data: JSON.stringify( obj ), 
            contentType: 'application/json',
            success: function(res) {
                console.log(res);
                console.log("Added");
            }.bind(this),
            error: function(error){
                console.log(error)
            }
        }); 
    }
    const remove = () => {

    }
    create();
    // Test if entry exists
}