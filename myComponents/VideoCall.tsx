import React from "react";
import {useParams} from 'react-router-dom';
import {ZegoUIKitPrebuilt} from '@zegocloud/zego-uikit-prebuilt';
const RoomPage=()=>{
    const {RoomId}=useParams();
const MyMeeting= async (element)=>{
const AppId=74206127;
const ServerSecret='20a0c3c047ae13bf7a606cd5fef59b3e'
const kitToken=ZegoUIKitPrebuilt.generateKitTokenForTest(AppId,ServerSecret,RoomId,'user','kumud')
const zc=ZegoUIKitPrebuilt.create(kitToken);
zc.joinRoom({
    container:element,
    sharedLinks:[{
name:'Copy Link',
URL:`https://localhost:3000/room/${RoomId}`,
scenario:{
    mode:ZegoUIKitPrebuilt.OneONoneCall,
}}]
  
})
}
return(
    <>
    <div>
        <div ref={MyMeeting}/>
    </div>
    </>
)
}