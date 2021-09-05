import { createContext, useState, useEffect } from 'react';

const FavoritesContext = createContext({
    favorites: [],
    totalFavorites: 0,
    addFavorite: (favoriteMeetup) => {}, // the following empty methods do nothing but just help with autocompletion
    removeFavorite: (meetupId) => {},
    itemIsFavorite: (meetupId) => {}
});

// Similar to an Angular service
export function FavoritesContextProvider(props) {
    const [userFavorites, setUserFavorites] = useState([]);
    
    useEffect(() => {
        let count = 0;
        if (count === 0) {
            openDB();
            count = 1;
        }
    }, [])
    
    
    
    async function openDB() {

        const STORE_NAME = 'favorites';
        const DB_NAME = 'MeetupDB';
        let db ;
        let transaction ;
        let objectStore ; 

        if (!window.indexedDB) {
            console.log("Your browser does not support stable version of indexDB");
            setUserFavorites([]);
        } else {
            var request = window.indexedDB.open(DB_NAME, 3);

            request.onupgradeneeded = function(event) {
                // Create a new object store if this is the first time we're using
                // this DB_NAME/DB_VERSION combo.
                db = event.target.result;
                objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" })

                objectStore.createIndex("image", "image", { unique: false });
                objectStore.createIndex("title", "title", { unique: false });
                objectStore.createIndex("address", "address", { unique: false });
                objectStore.createIndex("description", "description", { unique: false });
                setUserFavorites([]);
            };

            request.onsuccess = function (event) {
                // set favorites to favorites from DB_NAME
                // fetch meetups from DB_NAME favoritesTable
                db = event.target.result;
                transaction = db.transaction([STORE_NAME], "readwrite");
                objectStore = transaction.objectStore(STORE_NAME);

                if ('getAll' in objectStore) {
                    objectStore.getAll().onsuccess = function(event) {
                        setUserFavorites(event.target.result);
                    }
                } else {
                    // Fallback to the traditional cursor approach if getAll isn't supported.
                    var favorites = [];
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result;
                            
                        if (cursor) {
                            favorites.push(cursor.value);
                            cursor.continue();
                        } else {
                            setUserFavorites(favorites)
                        }
                    };
                }
                
                // return {db, objectStore, STORE_NAME }
            }

            let myPromise = new Promise(function(myResolve, myReject) {
                setTimeout(() => {
                    myResolve ({db, objectStore, STORE_NAME })
                }, 300)
            });

            await myPromise;
            return myPromise;
        }
    }

    function addFavoriteHandler(favoriteMeetup) {
        openDB().then(value => {
            console.log(value);
            let transaction = value.db.transaction([value.STORE_NAME], "readwrite");
            let objectStore = transaction.objectStore(value.STORE_NAME);
            
            var request = objectStore.add(favoriteMeetup);
            request.onsuccess = function(event) {
                setUserFavorites((prevUserFavorites) => {
                    return prevUserFavorites.concat(event);
                })
            };

            request.onerror = function(event) {
               
            } 
        });  
    };

    function removeFavoritesHandler(meetupId) {
        openDB().then(value => {
           
            var request = value.db.transaction([value.STORE_NAME], "readwrite")
            .objectStore(value.STORE_NAME)
            .delete(meetupId);

            request.onsuccess = function(event) {
                setUserFavorites((prevUserFavorites) => {
                    return prevUserFavorites.filter( meetup => meetupId !== meetup.id );
                })
            };
        })
        
    };

    function itemIsFavoriteHandler(meetupId) {
        return userFavorites.some(meetup => meetupId === meetup.id);
    };

    const context = {
        favorites: userFavorites,
        totalFavorites: userFavorites.length,
        addFavorite: addFavoriteHandler,
        removeFavorite: removeFavoritesHandler,
        itemIsFavorite: itemIsFavoriteHandler
    };

    return <FavoritesContext.Provider value={context}>
        {props.children}
    </FavoritesContext.Provider>
}

export default FavoritesContext;