'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ToastAndroid,
  PanResponder,
  StyleSheet,
  Dimensions,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import Camera from 'react-native-camera';
var CIRCLE_SIZE = 70;
var {height,width}=Dimensions.get('window');
let extension=[];
let result;
var timerID = 0;
export default class custcomponent extends Component {
  constructor() {
    super();
    Alert.alert('hi');
    console.log(height/2.5);
    this.state={
	     _isPanicCase: true,
      _curTime: 0,
      _buttonPress: false,
      _isVideoPlaying: false,
      path:null,
      show:0,
      latitude: 0,
      longitude: 0,
      location: null,
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      toggle:0,
      _videoWillEnd: false,
      _videoEnd: false,
      hide:false,
      clicked:0,
      videosTaken:0,
      video:false,
      camfront:false,
      flashOn:false,
      playSound:true,
      hr:new Date().getHours()<10 ? '0'+new Date().getHours:new Date().getHours(),
      min:new Date().getMinutes()<10 ? '0'+new Date().getMinutes():new Date().getMinutes(),
      s:'00',
      m:'00',
      mins :0,
      secs:0,
      //pan     : new Animated.ValueXY() ,
      dropZoneValues  : null,
      showDraggable   : true,
      //selectedImageValue:this.props.arr.albums[this.props.arr.albums.length-1]
    }
    watchID: null
    _panResponder: {}
    _previousLeft: 0
    _previousTop: 0
    _circleStyles: {}
    circle: null //:? { setNativeProps(props: Object): void })
    console.disableYellowBox = true;
    this.takePicture=this.takePicture.bind(this);
    this.renderFlashIcon=this.renderFlashIcon.bind(this);
    this.renderMsg=this.renderMsg.bind(this);
    this.renderTopView=this.renderTopView.bind(this);
    this.renderPanicView=this.renderPanicView.bind(this);
    this.startRecording=this.startRecording.bind(this);
    this.stopRecording=this.stopRecording.bind(this);
    //this.updateTime=this.updateTime.bind(this);
  }
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this._previousLeft = width/15;
    this._previousTop = height/2;
    this._circleStyles = {
      style: {
        left: this._previousLeft,
        flexDirection: 'column',
        top: this._previousTop,
        backgroundColor: 'white',
      }
    };
  }
  componentDidMount () {
    navigator.geolocation.getCurrentPosition(
    (position) => {
      var initialPosition = JSON.stringify(position);
      this.setState({initialPosition});
    },
    (error) => console.log(error),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({lastPosition});
    });
    this._updateNativeStyles();
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
  isDropZone(gesture){
    var dz = this.state.dropZoneValues;
    return gesture.moveY > dz.y && gesture.moveY < dz.y + dz.height;
  }
  getCurTime(){
    var temp =  new Date();
    return(temp.getTime());
  }
  setVideoTimer(){
    if(this.state.video==true)
    {
      setInterval(()=>{ if(this.state.secs<60)
      this.setState({secs:this.state.secs+1})
      else
      {
        this.setState({mins:this.state.mins+1})
        this.setState({secs:0})
      }
      if(this.state.secs<10||this.state.mins<10)
      {
        this.setState({s:'0'+this.state.secs});
        this.setState({m:'0'+this.state.mins});
      }
      else
      {
        this.setState({s:this.state.secs});
        this.setState({m:this.state.mins});
      }
      },1000)
      console.log(this.state.m,':',this.state.s);
      console.log(this.state.mins,':',this.state.secs);
    }

  }
  updateTime(){
    setInterval(()=>{
      if(new Date().getHours()<10)
        this.setState({hr:'0'+new Date().getHours()})
      else
        this.setState({hr:new Date().getHours()})
    } ,600000);
    setInterval(()=>{
      if(new Date().getMinutes()<10)
        this.setState({min:'0'+new Date().getMinutes()})
      else
        this.setState({min:new Date().getMinutes()})
    },60000);
    setInterval(()=>{
      if(new Date().getSeconds()<10)
        this.setState({sec:'0'+new Date().getSeconds()})
      else
        this.setState({sec:new Date().getSeconds()})
    },1000)
  }
  setDropZoneValues(event){
    this.setState({
      dropZoneValues : event.nativeEvent.layout
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={{flex: 1}}
          aspect={Camera.constants.Aspect.fill}
          captureMode={this.state.video ?Camera.constants.CaptureMode.video:Camera.constants.CaptureMode.camera}
          playSoundOnCapture={this.state.playSound}
          type={this.state.camfront ?Camera.constants.Type.front :Camera.constants.Type.back}
          flashMode={this.state.flashOn ?Camera.constants.FlashMode.on :Camera.constants.FlashMode.off }>

          <View style={styles.cam}>
            <View style={styles.subView}>
              {this.renderTopView()}
            </View>
          <View style={{height:50,alignSelf:'stretch'}}/>
            <View>
              <View style={[styles.translucentRow,{opacity:this.state.show}]}>
                <ScrollView style={styles.scrollView} horizontal={true}>
                  <View style={styles.imageBox}>
                    {this.renderImageBoxes()}
                  </View>
                </ScrollView>
              </View>
              <View style={[{opacity:this.state.toggle},styles.forward]}>
                <TouchableOpacity onPress={this.props.openPublish}>
                  <Image style={[{opacity:this.state.toggle},styles.forwardIcon]} source={{uri:'upload'}}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.buttonBox}>
            <View style={styles.caseTabView}>
              {this.showOrHideCaseButton()}
            </View>
            <View style={styles.captureTabView}>
              <View  style={styles.subView}>
                {this.renderPanicView()}
              </View>
              <View ref={(circle) => {this.circle = circle;}}
                style={styles.circle}
                {...this._panResponder.panHandlers}/>
            </View>
            <View style={styles.profileTabView}>
              {this.showOrHideProfileButton()}
            </View>
          </View>
        </Camera>
      </View>
    );
  }
  startRecording = () => {
    this.setState({hide:true});
    this.setState({video:true});
    this.setState({videosTaken:this.state.videoTaken});
    if (this.camera) {
      this.camera.capture({mode: Camera.constants.CaptureMode.video})
      .then((data) => {
        this.state.path=data.path;
        console.log("Video : ",this.state.path);
        if(this.state._videoWillEnd){
          console.log("Panic Video");
          console.log('in upload video');
          //console.log(this.state.path);
          let formdata = new FormData();
          let video = {
            uri: this.state.path,
            name: 'second.mp4',
            type: 'video/mp4'
          }
          let lat =28.6279273;
          let longitude =77.3803972;
          let location="Noida, India";
          formdata.append('video',video);
          formdata.append('latitude', lat);
          formdata.append('longitude',longitude);
          formdata.append('location',location);
          try{
            fetch('http://transitapi.sia.co.in/case/panic/',{
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization':'Bearer '+'rashmimaulekhi'
              },
              body: formdata
            }).then((response)=>{
              if(response.status==201){
                console.log('response status of upload video:',response.status);
                response.json().then((responseData) => {
                  console.log('responseData of upload video:',responseData);
                })
              }
              else{
                if(response.status==400){
                  console.log('response status of upload video:',response.status);
                  response.json().then((responseData) => {
                    console.log("inside responseData 400:",responseData);})
                  }
                  else{
                    console.log('hi else of upload video',response.status)
                    console.log('response status of upload video:',response.status);
                  }
                }
              }).done();
          }
          catch(e){
            console.error(e);
          }
          console.log("Video Upload Done");
          }
          else{
            console.log("Normal Video");
          }
        })
        .catch(err => console.error(err));
        this.setState({
          isRecording: true
      });
    }
  }
  takePicture=()=> {
    this.camera.capture()
    .then((data) => {
      console.log(data)
      /*this.setState({show:0.5});
      this.setState({hide:true});
      this.setState({path:data.path});
      this.setState({newImage:data.path});
      this.setState({clicked:this.state.clicked+1});
      if(this.state.clicked==1)
      this.setState({toggle:1});
      this.props.addImage(data.path);*/
    })
    .catch(err => console.error(err));
  }
  stopRecording = () => {
    if (this.camera) {
      this.camera.stopCapture();
      this.setState({
        isRecording: false
      });
    }
  }
  renderPanicView() {
    if(this.state.video && this.state.clicked<1)
    {
      return <Image  onLayout={this.setDropZoneValues.bind(this)} style={styles.captureIcon1} source={{uri:'hollowwhite'}}/>
    }
  }
  renderTopView(){
    if(!this.state.video)
    return (
      <View style={styles.topView}>
        <TouchableOpacity style={{flex:.25,alignSelf:'center'}} onPress={()=>this.setState({flashOn:!this.state.flashOn})}>
          {this.renderFlashIcon(this.state.flashOn)}
        </TouchableOpacity>
        <TouchableOpacity style={{flex:.25,alignSelf:'center'}} onPress={()=>this.setState({camfront:!this.state.camfront})}>
          <Image style={styles.camRotImage} source={{uri:'camrotation'}}/>
        </TouchableOpacity>
        <View style={styles.timeView}>
          <Text style={styles.timeText}>{this.state.hr}:{this.state.min}</Text>
        </View>
        <TouchableOpacity style={{flex:.25,alignSelf:'center'}} onPress={()=>console.log('gps')}>
          <Image style={styles.locImage} source={{uri:'gps'}}/>
        </TouchableOpacity>
      </View>
    )
    return (
      <View style={{paddingTop:10}}>
        <View style={styles.videoTimerView}>
          <Text style={styles.videoTimerText}>{this.state.m}:{this.state.s}</Text>
        </View>
      </View>
    )
  }
  renderFlashIcon(flashOn){
    if (flashOn) {
      return <Image style={{width:20,height:20,alignSelf:'flex-start'}} source={{uri:'flashon'}} />;
    }
    else {
      return <Image style={{width:20,height:20,alignSelf:'flex-start'}} source={{uri:'flashoff'}} />;;
    }
  }
  showOrHideCaseButton(){
    if(!this.state.hide)
      return <TouchableOpacity style={styles.casesButton}  onPress={this.props.openCases}>
        <Image style={styles.icon} source={{uri:'casescircle'}}/>
        <Text style={{color:'#fff'}}>Cases</Text>
      </TouchableOpacity>
  }
  showOrHideProfileButton(){
    if(!this.state.hide)
    return   <TouchableOpacity style={styles.profileButton} onPress={this.props.openProfile}>
    <Text style={{color:'#fff'}}>Profile</Text>
    <Image style={styles.icon} source={{uri:'profilecircle'}}/>
    </TouchableOpacity>

  }
  renderMsg(){
    if(this.state.clicked==0)
    return <View style={{bottom:height/10}}>
    <Text style={{textAlign:'center'}}>Please capture clear picture of the incident</Text>
    </View>
  }
  renderImageBoxes(){
    if(this.state.clicked){
      return this.props.arr.albums.map((value,index)=>{ extension=value.split('.');
        if(extension[1]=='jpg')
        return (<View  key={index} style={{flexDirection:'row'}}>
        <View style={styles.imageView}>
          <Image  style={styles.image} source={{uri:value}}/>
        </View>
        <View style={styles.imageSpacer}/>
        </View>  )
        else if(extension[1]=='mp4')
          return (<View  key={index} style={{flexDirection:'row'}}>
            <View style={styles.imageView}>
              <Image  style={styles.image} source={{uri:value}}>
                <Image style={{width:30,height:30,alignSelf:'center'}} source={{uri:'thumbnail'}}/>
              </Image>
            </View>
            <View style={styles.imageSpacer}/>
          </View>  )
      }
      )
    }
  }
  _highlight() {
    this._circleStyles.style.backgroundColor = 'red';
    this._updateNativeStyles();
  }
  _unHighlight() {
    this._circleStyles.style.backgroundColor = 'white';
    this._updateNativeStyles();
  }
  _updateNativeStyles=()=> {
    this.circle && this.circle.setNativeProps(this._circleStyles);
  }
  _handleStartShouldSetPanResponder(e: Object, gestureState: Object): boolean {
    return true;
  }
  _handleMoveShouldSetPanResponder(e: Object, gestureState: Object): boolean {
    return true;
  }
  _handlePanResponderGrant=(e: Object, gestureState: Object)=> {
    this.setState({_buttonPress: true});
    let t = this.getCurTime();
    timerID = setInterval(()=>{
      var t1 = this.getCurTime();
      var dif = t1-(this.state._curTime);
      if(this.state._buttonPress){
        if(!this.state._isVideoPlaying){
          if(dif < 1000){
          }
          else{
            this.startRecording();
            this.setState({_isVideoPlaying: true});
            clearInterval(timerID);
          }
        }
      }
    },100);
    this.setState({_curTime: t});
    this._highlight();
  }
  _handlePanResponderMove=(e: Object, gestureState: Object)=> {
    if(this._circleStyles.style.top>=height/3.8){
      console.log('recording....');
      this.setState({_videoWillEnd: false});
	    if(this.state._isPanicCase){
		      this._circleStyles.style.top = this._previousTop + gestureState.dy;
	     }
    }
    else{
      if(!this.state._videoEnd){
        this.setState({_videoWillEnd: true});
      }
      else{
        console.log('recorded');
      }
    }
    this._updateNativeStyles();
  }
  _handlePanResponderEnd=(e: Object, gestureState: Object)=> {
    if(this.state._isVideoPlaying && this.state._videoWillEnd && this.state._isPanicCase){
      this.stopRecording();
      ToastAndroid.show('Panic Video Recorded', ToastAndroid.SHORT);
    }
    else if (this.state._isVideoPlaying) {
      this.stopRecording();
	    this.setState({_isPanicCase: false});
      ToastAndroid.show('Normal Video Recorded', ToastAndroid.SHORT);
    }
    else{
      this.takePicture();
      //IMAGE CAPTURE API HIT
	    this.setState({_isPanicCase: false});
      ToastAndroid.show('Capture', ToastAndroid.SHORT);
    }
    this.setState({_buttonPress: false});
    this.setState({_isVideoPlaying: false});
    this._circleStyles.style.left = this._previousLeft;
    this._circleStyles.style.top = this._previousTop;
    this._unHighlight();
  }
}     //CLASS CLOSING POINT
const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    top: 0,
  },
  container: {
    flex: 1,
    flexDirection:'column'
  },
  subView:{
    paddingLeft:0.5,
    alignSelf:'stretch',
    alignItems:'center',
    height: height/2.5
  },
  topView:{
    flexDirection:'row',
    alignSelf:'stretch',
    justifyContent:'space-between',
    paddingLeft:30,
    paddingRight:10,
  },
  videoTimerView:{
    backgroundColor:'black',
    opacity:.5,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    width:Dimensions.get('window').width/4
  },
  videoTimerText:{
    textAlign:'center',
    color:'#ffffff'
  },
  timeView:{
    justifyContent:'center',
    flex:.25,
  },
  timeText:{
    color:'white',
    fontWeight:'bold',
    flex:.25,
    textAlign:'center',
    paddingTop:10,
    opacity:1
  },
  caseTabView:{
    flex:33,
    paddingBottom: 10,
    flexDirection: 'column-reverse'
  },
  profileTabView:{
    flex:33,
    paddingBottom: 10,
    flexDirection: 'column-reverse'
  },
  scrollViewParent:{
    paddingLeft:5,
    paddingRight:10,
    alignSelf:'flex-end',
    justifyContent:'space-between',
    flexDirection:'row',
  },
  scrollViewAndImageBox:{
    flexDirection:'column',
    height:75,
    alignSelf:'stretch',
    borderWidth:1,
    borderColor:'red'
  },
  locImage:{
    width:20,
    height:20,
    alignSelf:'center',
    opacity:1
  },
  camRotImage:{
    width:35,
    height:35,
    alignSelf:'center',
    opacity:1
  },
  image:{
    width:43,
    height:45,
    justifyContent:'center'
  },
  preview: {
    flex: 1,
    paddingBottom:15,
    flexDirection:'column-reverse',
    alignItems: 'center',
    height:Dimensions.get('window').height,
    width:Dimensions.get('window').width
  },
  imageView:{
    height:43,
    width:45,
    borderColor:'white',
    flex:9,
    alignSelf:'center',
    borderWidth:1
  },
  imageBox:{
    flexDirection:'row-reverse',
    justifyContent:'space-between',
    paddingLeft:10
  },
  forwardIcon:{
    width:40,
    height:40
  },
  casesButton:{
    flexDirection:'column',
    paddingTop:10,
    alignItems: 'center',
  },
  captureIcon:{
    width:70,
    height:70,
    alignSelf:'center'
  },
  buttonBox:{
    flex:2,
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'transparent',
    alignSelf:'stretch',
    paddingLeft:10,
    paddingRight:10
  },
  profileButton:{
    flex:33,
    flexDirection:'column-reverse',
    alignItems: 'center',
    paddingTop:10,
  },
  cam:{
    flex:.85,
    flexDirection:'column',
    justifyContent:'space-between',
    backgroundColor:'transparent',
    alignSelf:'stretch',
  },
  latlongView:{
    flexDirection:'column',
    justifyContent:'flex-start'
  },
  latlong:{
    color:'white',
    fontWeight:'bold'
  },
  captureButton:{
    flexDirection:'column-reverse',
    alignItems:'center',
    justifyContent:'center',
    alignSelf:'center',
  },
  captureTabView:{
    flex:34,
    flexDirection: 'column-reverse',
    paddingBottom: 10,
  },
  scrollview:{
    alignItems:'center',
    flexDirection:'row-reverse',
    paddingRight:10
  },
  translucentRow:{
    height:50,
    alignSelf:'flex-end',
    flexDirection:'row',
    position:'relative',
    paddingLeft:10,
    paddingTop:2,
    backgroundColor:'black'
  },
  /*forward:{
    width:40,
    height:40,
    position:'absolute',    this.state={

    bottom:height/19.33,
    left:width/1.16
  },*/
  icon:{
    width:30,
    height:30
  },
  imageSpacer:{
    flex:2,
    alignSelf:'stretch',
    borderWidth:5,
    opacity:.015
  },
  captureIcon1:{
    width:80,
    height:80,
    alignItems:'center',
    justifyContent:'center',
    alignSelf:'center',
  }
});
AppRegistry.registerComponent('custcomponent', () => custcomponent);
