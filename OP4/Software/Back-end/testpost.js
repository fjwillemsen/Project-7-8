$.ajax({
    url: "https://xtremeresq.ddns.net:8082/testpost",
    type: "POST",
    data: {
        blob: {wob:"1",job:"2", ar:[1,2,{a:'b'}]}
    },

    contentType: "application/x-www-form-urlencoded", //This is what made the difference.
    dataType: "json",
    success: function(data) {
        console.log(data);
    },
    error: function() { 
        console.log("error");
    }
});
console.log("done");