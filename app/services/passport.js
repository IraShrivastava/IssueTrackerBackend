const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const time = require('./../libs/timeLib');
const User = mongoose.model('SocialUser')

passport.serializeUser((user, done) => {
    //console.log(user.id);
    done(null, user.id)
   // console.log('serialization successful')
})

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user)
        })
})

passport.use(new GoogleStrategy({
    
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: '/auth/google/callback',
    proxy: true
}, (accessToken, refreshToken, profile, done) => {
   // console.log(profile)
    for (let x of profile.emails) {
        
        var email = x.value
        
    }
    User.findOne({ userId: profile.id }).then((currentUser)=>{
        if (currentUser) {
           // console.log(currentUser)
             
           //  console.log('user is'+currentUser)
            done(null, currentUser)
         } else {
            new User({
                 userId: profile.id,
                 firstName: profile.name.givenName,
                 lastName: profile.name.familyName,
                 email: email,
                 createdOn: time.now()
             }).save().then((newUser)=>{
                done(null, newUser)
             })
            
             
     
         }
     
    })
    //console.log(existingUser)

    
})

);
































