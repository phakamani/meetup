import { Link } from 'react-router-dom'

function MainNavigation() {
    return (
        <header>
            <div>React Meetups</div>
            <nav>
                <ul>
                    <Link to="/">All Meetups</Link>
                    <Link to="/new-meetup">Add New Meetup</Link>
                    <Link to="/favorites">My Favorites</Link>
                </ul>
            </nav>
        </header>
    )
}

export default MainNavigation