"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SoundscapesPlayer() {
  const [defaultPlaylists, setDefaultPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(
    "37i9dQZF1DX8Uebhn9wzrS", 
  ); 

  const [spotifyToken, setSpotifyToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("default"); 

  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDefaultPlaylists();

  
    const urlParams = new URLSearchParams(window.location.search);
    const token = 
      urlParams.get("spotifyToken") || 
      urlParams.get("token") || 
      urlParams.get("access_token");

    if (token) {
      localStorage.setItem("spotify_token", token);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpotifyToken(token);
      // eslint-disable-next-line react-hooks/immutability
      fetchUserPlaylists(token);
     
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedToken = localStorage.getItem("spotify_token");
      if (savedToken) {
        setSpotifyToken(savedToken);
        fetchUserPlaylists(savedToken);
      }
    }
  }, []);

  const fetchDefaultPlaylists = async () => {
    try {
      const res = await fetch(
        "https://localhost:7112/api/Spotify/default-playlists",
      );
      if (res.ok) {
        const data = await res.json();
        setDefaultPlaylists(data);
        
      }
    } catch (err) {
      console.error("failed to fetch default playlists:", err);
    }
  };

  const fetchUserPlaylists = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://127.0.0.1:7112/api/Spotify/user-playlists",
        {
          headers: {
            "Spotify-Token": token,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(data);
        setTab("user"); 
      } else {
       
        localStorage.removeItem("spotify_token");
        setSpotifyToken(null);
      }
    } catch (err) {
      console.error("failed to fetch user playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white-900/80 border border-red-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1">
          <div className="w-20 h-10 rounded-2xl flex items-center justify-center text-blue-400">
            <Image src="/note.png" width={60} height={60} alt="tomato"/>
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center  text-slate-900">
              Focus Music & Soundscapes
            </h2>
            
          </div>
        </div>
      </div>

    
      {spotifyToken && (
        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab("default")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              tab === "default"
                ? "bg-slate-800 text-cyan-400 font-medium"
                : "text-slate-400 hover:text-white"
            }`}
          >
           default playlists
          </button>
          <button
            onClick={() => setTab("user")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              tab === "user"
                ? "bg-red-800 text-cyan-400 font-medium"
                : "text-red-400 hover:text-white"
            }`}
          >
         
          </button>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {(tab === "default" ? defaultPlaylists : userPlaylists).map(
          (playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-right ${
                selectedPlaylistId === playlist.id
                  ? "bg-red-500/10 border-red-500/50 text-red-700"
                  : "bg-white border-red-800/80 text-slate-400 hover:red-slate-700"
              }`}
            >
              <Image src="/char4.png" width={40} height={40} alt="tomato"/>
              <span className="text-xs font-medium truncate flex-1">
                {playlist.name}
              </span>
            </button>
          ),
        )}
      </div>

      
      <div className="rounded-2xl overflow-hidden ">
        <iframe
          src={`https://open.spotify.com/embed/playlist/${selectedPlaylistId}?utm_source=generator&theme=1`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-2xl"
        ></iframe>
      </div>
    </div>
  );
}