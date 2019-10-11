import React, { Component } from 'react'
import { Text, TextInput, Image, ImageBackground, View, Button, StyleSheet, Vibration, Platform } from 'react-native'
 
export default class HelloWorldApp extends Component {
 
   constructor(props){
      super(props)
      this.state={
         login:'',
         pass:'',
      }
   }
 
   onPressButtonLogIn=()=> {
      Vibration.vibrate(150)
      const {login,pass}=this.state
      if(login==''){
         alert('lol')
      }
      else if(login==undefined){
         alert('lol')
      }
      else{
 
      }
      alert(login+"\n"+pass)
   }
 
   onPressButtonSignUp() {
      Vibration.vibrate(450)
 
   }
    
 
   render() {
      return (
         <ImageBackground source={require("C:/cmder/plano/back.jpg")} style={{ width: '100%', height: '100%' }}>
 
            <View style={(styles.container)}>
               <View style={(styles.inputContainer)}>
                  <TextInput
                     style={(styles.LoginInputContainer)}
                     placeholder="Login"
                     keyboardType='email-address'
                     onChangeText={login => this.setState({login})}
                  />
 
                  <TextInput
                     style={(styles.PasswordInputContainer)}
                     placeholder="Password"
                     onChangeText={pass => this.setState({pass})}            
                  />
               </View>
 
 
               <View style={(styles.allButtonContainer)}>
                  <View style={(styles.buttonContainer)}>
                     <Button
                        onPress={(this.onPressButtonLogIn)}
                        title='Log in'
                        color='hsla(120, 100%, 30%, 1)'
                     />
                  </View>
 
                  <View style={(styles.buttonContainer)}>
                     <Button
                        onPress={(this.onPressButtonSignUp)}
                        title='Sign up'
                        color="hsla(300, 73%, 30%, 1)"
                     />
                  </View>
 
               </View>
 
            </View>
         </ImageBackground>
      )
   }
}
 
 
const styles = StyleSheet.create({
   container: {
      position: 'relative',
      height: '100%',
   },
   allButtonContainer: {
      position: 'absolute',
      bottom: 170,
      width: '100%',
   },
   buttonContainer: {
      margin: 10
   },
 
   inputContainer: {
      position: 'absolute',
      bottom: 350,
      width: '100%',
   },
 
   PasswordInputContainer: {
      fontSize: 30,
      width: '90%',
      height: 40,
      borderBottomColor: 'white',
      borderBottomWidth: 1,
      margin: (0, '5%', 0, '5%')
   },
   LoginInputContainer: {
      fontSize: 30,
      width: '90%',
      height: 40,
      borderBottomColor: 'white',
      borderBottomWidth: 1,
      margin: (0, '5%', 0, '5%')
   },
})