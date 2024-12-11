const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = ( username ) => {
	return !users.some( user => user.username === username);
}


const authenticatedUser = ( username, password ) => {
	return users.some( user => user.username === username && user.password === password );
}


regd_users.post( "/login", ( req, res ) => {

	const { username, password } = req.body;

	if( !username || !password ) {
		return res.status( 400 ).json( { message: "All fields are required." } );
	}

	if( !authenticatedUser( username, password ) ) {
		return res.status( 401 ).json( { message: "Incorrect username or password." } );
	}

	const token = jwt.sign( { username }, "fingerprint_customer", { expiresIn: "10 Minutes" } );
	req.session.token = token;

	return res.status( 200 ).json( { 
		message: `¡Welcome, ${username}!`, 
		token 
	} );	

} );


regd_users.put( "/auth/review/:isbn", ( req, res ) => {

	const token = req.session.token;

	if( !token ) {
		return res.status( 401 ).json( { message: "User not authenticated." } );
	}

	let username;

	try {
		const decoded = jwt.verify( token, "fingerprint_customer" );
		username = decoded.username;
	} catch ( err ) {
		return res.status( 403 ).json( { message: "Invalid or expired token." } );
	}

	const { isbn } = req.params;

	if( !books[ isbn ] ) {
		return res.status( 404 ).json( { message: "Book not found." } );
	}

	const { review } = req.body;

	if( !review ) {
		return res.status( 400 ).json( { message: "Review is required." } );
	}

	books[ isbn ].reviews[ username ] = review;

	return res.status( 200 ).json( {
		message: "Review added/updated successfully.",
		reviews: books[ isbn ].reviews
	} );

});


regd_users.delete( "/auth/review/:isbn", ( req, res ) => {
    
	const token = req.session.token;

    if( !token ) {
        return res.status( 401 ).json( { message: "User not authenticated." } );
    }

    let username;

    try {
        const decoded = jwt.verify( token, "fingerprint_customer" );
        username = decoded.username;
    } catch( err ) {
        return res.status( 403 ).json( { message: "Invalid or expired token." } );
    }

    const { isbn } = req.params;

    if( !books[ isbn ] ) {
        return res.status( 404 ).json( { message: "Book not found." } );
    }

    const userReviews = books[ isbn ].reviews;

    if( !userReviews[ username ] ) {
        return res.status( 404 ).json( { message: `Review not found for the user ${username}` } );
    }

    delete userReviews[ username ];

    return res.status( 200 ).json( {
        message: "Review deleted successfully.",
        reviews: userReviews
    } );

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
