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
    const [STORE_NAME, setSTORE_NAME] = useState('');
    const [DB_NAME, setDB_NAME] = useState('');
    const [db, setDb] = useState(undefined);
    const [transaction, setTransaction] = useState(undefined);
    const [objectStore, setObjectStore] = useState(undefined);
  

    // In the following line, you should include the prefixes of implementations you want to test.
    // window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    useEffect (() => {
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
        setSTORE_NAME('favorites');
        setDB_NAME('MeetupDB')

        if (!window.indexedDB) {
            console.log("Your browser does not support stable version of indexDB");
            // setUserFavorites([]);
        } else {
            var request = window.indexedDB.open(DB_NAME, 3);

            request.onupgradeneeded = function(event) {
                // Create a new object store if this is the first time we're using
                // this DB_NAME/DB_VERSION combo.
                setDb(event.target.result);
                setObjectStore(db.createObjectStore(STORE_NAME, { keyPath: "id" }))

                objectStore.createIndex("image", "image", { unique: false });
                objectStore.createIndex("title", "title", { unique: false });
                objectStore.createIndex("address", "address", { unique: false });
                objectStore.createIndex("description", "description", { unique: false });
                setUserFavorites([]);

                // meetup object params
                // id={meetup.id}
                // image={meetup.image}
                // title={meetup.title}
                // address={meetup.address}
                // description={meetup.description}
            };

            request.onsuccess = function (event) {
                // set favorites to favorites from DB_NAME
                // fetch meetups from DB_NAME favoritesTable
                setDb(event.target.result);
                setTransaction(db.transaction([STORE_NAME], "readwrite"));
                setObjectStore(transaction.objectStore(STORE_NAME));

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
            
            }

            request.onerror = function (event) {
                setUserFavorites([]);
            }
        }
    }, [DB_NAME, STORE_NAME, db, objectStore, transaction]);
    

    function addFavoriteHandler(favoriteMeetup) {
        setObjectStore(transaction.objectStore(STORE_NAME));
        userFavorites.forEach(function(favorites) {
            var request = objectStore.add(favoriteMeetup);
            request.onsuccess = function(event) {
                // event.target.result === customer.ssn;
                setUserFavorites((prevUserFavorites) => {
                    return prevUserFavorites.concat(event);
                })
            };

            request.onerror = function() {
                setUserFavorites([])
            } 
        });
    };

    function removeFavoritesHandler(meetupId) {
        // TODO: remove from localStorage or indexDB
        var request = db.transaction([STORE_NAME], "readwrite")
            .objectStore(STORE_NAME)
            .delete(meetupId);

        request.onsuccess = function(event) {
            alert("favorite removed");
            setUserFavorites((prevUserFavorites) => {
                return prevUserFavorites.filter( meetup => meetupId !== meetup.id );
            })
        };
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