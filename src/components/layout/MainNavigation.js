import { useContext } from 'react';
import { Link } from 'react-router-dom';

import classes from './MainNavigation.module.css';
import FavoritesContext from '../../store/favorites-context';


function MainNavigation() {
    const favoritesCtx = useContext(FavoritesContext);

    return (
        <header className={classes.header}>
            <div className={classes.logo}>React Meetups</div>
            <nav>
                <ul>
                    <Link to="/">All Meetups</Link>
                    <Link to="/new-meetup">Add New Meetup</Link>
                    <Link to="/favorites">
                        My Favorites
                        <span class={classes.badge}>{favoritesCtx.totalFavorites}</span>
                    </Link>
                </ul>
            </nav>
        </header>
    )
}

export default MainNavigation