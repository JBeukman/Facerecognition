import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';



const particleOptions = {
        particles: {
          number: {
            value: 300,
            density: {
              enable: true,
              value_are: 200

            }
          }             
        }
      }
const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedin: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
      
    
  }

  loadUser = (user) => {
    this.setState({user: {
      id: user.id,
        name: user.name,
        email: user.email,
        entries: user.entries,
        joined: user.joined
   } })
  }

calculateFaceLocation = (data) => {
 const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
 const image = document.getElementById('inputimage');
 const width = Number(image.width);
 const height = Number(image.height);
 return {
  leftCol: clarifaiFace.left_col * width,
  topRow: clarifaiFace.top_row * height,
  rightCol: width - (clarifaiFace.right_col * width),
  bottomRow: height - (clarifaiFace.bottom_row * height)
 }
}

displayFaceBox = (box) => {
  this.setState({box: box});
}

  onInputChange = (event) => {
      this.setState({input: event.target.value});
  }

onButtonSubmit = () => {
  this.setState({imageUrl: this.state.input});
  fetch('http://localhost:8080/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        input: this.state.input
      })
      })
  .then(response => response.json())
  .then(response => {
    if  (response) {
      fetch('http://localhost:8080/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
        id: this.state.user.id
      })
      })  
      .then(response => response.json())
      .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}))
    })
      .catch(console.log)

}
    this.displayFaceBox(this.calculateFaceLocation(response))
})
.catch(err => console.log(err));  
}

onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState(initialState)
  } else if (route === 'home') {
    this.setState({isSignedin: true})
  }
  this.setState({route: route});
}

  render() {
  return ( 
    <div className="App">
      <Particles className='particles' 
       params={particleOptions}
     />
      <Navigation isSignedIn={this.state.isSignedin} onRouteChange={this.onRouteChange}/>
      {this.state.route === 'home' 
      ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm 
                      onInputChange={this.onInputChange}
                       onButtonSubmit={this.onButtonSubmit} 
                       />
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
            </div>
            : (
              this.state.route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
           )
      
   }
   </div>
  );
 }
}

export default App;
