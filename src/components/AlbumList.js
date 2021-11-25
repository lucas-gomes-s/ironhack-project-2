import Navbar from "./Navbar"
import {useState, useEffect} from "react"
import axios from "axios"
import AlbumCard from "./AlbumCard"

function AlbumList() {
    const display = 15 //number of cards initially displayed and added each time you click "show more"
    const [albuns, setAlbuns] = useState([]) //API call info
    const [search, setSearch] = useState("") //current search bar value
    const [filteredAlbuns, setFilteredAlbuns] = useState([]) // filtered based on search or tags
    const [pagination, setPagination] = useState(display) //number of cards shown
    const [tag, setTags] = useState([]) //tags that are displayed on the screen
    const [selectedTags, setSelectedTags] = useState([]) //tags that are seleceted



    useEffect(()=> {
        //Get API info 
        axios.get("https://ironrest.herokuapp.com/albuns")
        .then((response)=> {
            setAlbuns(response.data)
            setFilteredAlbuns(response.data)
        })
        .catch(error => console.log(error))
    }, [])


    useEffect(()=>{
        //filter based on tags
        let aux = [...albuns]
        if (selectedTags.length>0) {
            aux = aux.filter(album => {
                let keep = false
                if (album.tags) {                        
                    if (album.tags.tag.length>1) {
                        for (let i=0; i<album.tags.tag.length; i++) {
                            console.log()
                            keep = keep || selectedTags.includes(album.tags.tag[i].name)
                        }
                    }
                   else {
                        keep = keep || aux.includes(album.tags.tag.name)
                    }
                }
                return keep
                })
            }
            if (search !=="") {
                aux = aux.filter(album => {
                    let name = ""
                    if (album.name) {
                        name= album.name.toLowerCase()
                    }
                    let artist = "" 
                    if (album.artist) {
                        artist = album.artist.toLowerCase()
                    }
                    return (name.includes(search.toLowerCase()) || artist.includes(search.toLowerCase()))
                })
            }
        setFilteredAlbuns(aux)
    }, [selectedTags, search])
    


    useEffect(() => {
        //Checks most recurrent tags to be displayed 
        let displayTags = {}
        filteredAlbuns.map(album => {
            if (album.tags) {
                if (album.tags.tag.length > 1) {
                    album.tags.tag.map(tag => {
                        if (displayTags[tag.name]) {
                            displayTags[tag.name] += 1
                        }
                        else {
                            displayTags[tag.name] = 1
                        }
                    })
                }
                else {
                    if (displayTags[album.tags.tag.name]) {
                        displayTags[album.tags.tag.name] += 1
                    }
                    else {
                        displayTags[album.tags.tag.name] = 1
                    }
                }
            }
        })
        console.log(displayTags)
        let data= Object.keys(displayTags).sort(function(a,b){return displayTags[b]-displayTags[a]})
        setTags(data)
    }, [filteredAlbuns])
        



    function onChange(event) {
        setSearch(event.target.value)
        setPagination(display)
    }

    function onLoadMore() {
        setPagination(pagination+display)
    }

    function toTop() {
        window.scrollTo(0,0)
    }

    function onTagClick(event) {
        let aux = [...selectedTags]
        if(aux.includes(event.target.innerHTML)) {
            aux = aux.filter(value => value!==event.target.innerHTML)
            setSelectedTags(aux)
        }
        else {
            aux.push(event.target.innerHTML)
            setSelectedTags(aux)
        }

    }

    return(
        <div>
            <Navbar/>
            <div className="row m-2 d-flex justify-content-center">
                <div className="col-10">
                    <input className="form-control my-2" type="text" placeholder= "Search by album or artist" onChange={onChange}/>
                    <div className="row d-flex justify-content-center">
                        {tag.map((singleTag, index) => {
                            if (index < 10) {
                                if (selectedTags.includes(singleTag)) {
                                    return (
                                        <button className="col-2 m-1 btn btn-secondary" onClick={onTagClick} key={singleTag}>{singleTag}</button>
                                    )
                                }
                                else {
                                    return (
                                        <button className="col-2 m-1 btn btn-outline-secondary" onClick={onTagClick} key={singleTag}>{singleTag}</button>
                                    )
                                }
                            }
                        })}
                    </div>
                </div>
            </div>

            <div className="row m-2 d-flex justify-content-center">
                { 
                    filteredAlbuns.map((album, index)=> {
                        if (index<pagination) {
                            return(
                                <AlbumCard album={album}/>
                            )
                        }
                    })
                }
            </div>

            <div className="m-2 d-flex justify-content-center">
                <button className="col-9 btn btn-secondary" onClick={onLoadMore}>Load More</button>
            </div>
            <div className="m-2 d-flex justify-content-center">
                <button className="col-9 btn btn-light" onClick={toTop}>Back to Top</button>
            </div>
        </div>
    )
}

export default AlbumList