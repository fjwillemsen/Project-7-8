function submitWishlistAjax(url, data, fn) {
    $.ajax({
        url: url,
        type: 'POST',
        data: JSON.stringify(data),
        datatype: 'json',
        contentType: "application/x-www-form-urlencoded",
        success: function(data) {
            wishlist = data;
            if(fn) {
                fn();
            }
        },
        error: function() { }
    }); //Sends the account data to the server in a safe way
}

function submitViewWishList(wluser, fn) {
    var url = 'http://' + ip + ':' + port + '/wl';
    user.wishlistusername = wluser;
    submitWishlistAjax(url, user, fn);
}

function showWishList() {
    toggleAndSetSubbar('wishlist', 'wishlist', function() {
        setWishListView();
    });
}

function setPublicWishlistView(){
    setContentTo('allWishLists.html', function() {
        $.get('http://' + ip + ':' + port + '/wishlists', function(data){
            console.log(data);
            // var list = $('<div></div>');
            var list = '';
            for (var i = data.length - 1; i >= 0; i--) {
                var line = '<p onclick="showPublicWishList(\'' + data[i] + '\')">' + data[i] + '</p>';
                console.log(line);
                // list.append(line);
                list = list + line;
            }

            console.log(list);
            document.getElementById("publicWishlistUsers").innerHTML = list;
            // $('#publicWishlistUsers').replaceWith(list);
        });
    });
}

function showPublicWishList(username) {
    console.log(username);
    $.get('http://' + ip + ':' + port + '/user/' + username + '/wishlist', function (data) {
        var list = $('<div></div>');
        console.log(data);
        for (var i = data.length - 1; i >= 0; i--) {
            var line = $('<p onclick="setDetailView(' + data[i]._id+')" style="display: inline-block">' + data[i].properties.make + ' ' + data[i].properties.model + ' ' + data[i].properties.year + ' - </p>');
            list.append(line);
        }

        console.log(list);
        $('#publicWishListCurrent').html(list);
    });
}

function addToWishList(id) {
    if(user) {
        swal({
            title: "Wonderful!",
            text: "You've added it to wishlist!",
            timer: 1700
        });
        var url = 'http://' + ip + ':' + port + '/wladd';
        user.addwishlistid = id;
        submitWishlistAjax(url, user, function() {
            var list = $('<div></div>');
            for (var i = wishlist.length - 1; i >= 0; i--) {
                var line = $('<p style="display: inline-block">' + wishlist[i].properties.make + ' ' + wishlist[i].properties.model + ' ' + wishlist[i].properties.year + ' - </p><button style="display: inline-block">Add To Cart</button><button onclick="removeFromWishList(' + wishlist[i]._id + ')" style="display: inline-block">Remove</button><br>');
                list.append(line);
            }
            $('#wishlistlist').html(list);
        });
    } else {
        swal({
            title: "Ooops!",
            text: "You have to login in order to add items in your wishlist!",
            timer: 1700
        })
    }
}                    // Add items to wishlist

function removeFromWishList(id) {
    if(user) {
        user.removewishlistid = id;
        var url = 'http://' + ip + ':' + port + '/wldel';
        submitWishlistAjax(url, user, function() {
            setWishListView();
        });
    } else {
        swal({
            title: "Oops!",
            text: "You have to log in, in order to remove items from your wishlist",
            timer: 1700
        });
    }
}               // Remove items from wishlist

function setWishListView(uname) {
    if(user) {
        $("#wlsetvisibility").val(user.wishlist);
        var username = user.username;
        if(uname || uname != undefined) {
            username = uname;
        }

        submitViewWishList(username, function() {
            var list = $('<div></div>');
            for (var i = wishlist.length - 1; i >= 0; i--) {
                var line = $('<p onclick="setDetailView(' + wishlist[i]._id + ')" style="display: inline-block">' + wishlist[i].properties.make + ' ' + wishlist[i].properties.model + ' ' + wishlist[i].properties.year + ' - </p><button onclick="addCarToCart(\'' + wishlist[i]._id + '\', \'' + wishlist[i].properties.make + '\', \'' + wishlist[i].properties.model + '\', \'' + wishlist[i].properties.year + '\', \'' + wishlist[i].properties.price + '\')" style="display: inline-block">Add To Cart</button><button onclick="removeFromWishList(' + wishlist[i]._id + ')" style="display: inline-block">Remove</button><br>');
                list.append(line);
            }

            console.log(list);
            $('#wishlistlist').html(list);
            $('#wishlist #visibility').show();
        });

    } else {
        $('#wishlistlist').html('<a onclick="setLoginView()"><b style="color: white">Log in</b></a> before you can use the wishlist.');
    }
}

function submitVisibilityChange() {
    user.wlvisibility = $("#wlsetvisibility").val();
    console.log('u: ' + user.wlvisibility + ' $ ' + $("#wlsetvisibility").val());
    submitWishlistAjax('http://' + ip + ':' + port + '/wlvis', user);
}             // Toggles the wishlist visibility (public/private)
