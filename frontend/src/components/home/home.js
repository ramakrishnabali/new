import { useState,useContext } from "react"
import Context from "../../context"
import { useNavigate } from "react-router-dom"
import "./home.css"


const Home = ()=>{
    const navigate = useNavigate()
    // const [myName,setName] = useState("")
    const {name,updateName,socketId} = useContext(Context)

    const getName = (e)=>{
        updateName(e.target.value)
    }

    const getNavigate = ()=>{
        localStorage.setItem(name,socketId)
        navigate("/video")
    }
return(
    <div className="home-container">
        <input type="text" value={name} onChange={getName} placeholder="Enter Your Name"/>
        <button className="home-button" type="button" onClick={getNavigate} >Start Meeting</button>
    </div>
)
}
export default Home