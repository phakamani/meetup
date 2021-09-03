import classes from './MeetupList.module.css';
import MeetupItem from './MeetupItem.js';

function MeetupList (props) {  
    return(
        
        <ul className={classes.list}>
            {props.meetups.map((meetup) => (
                <MeetupItem key={meetup.id} 
                    id={meetup.id}
                    image={meetup.image}
                    title={meetup.title}
                    address={meetup.address}
                    description={meetup.description}/>
            ))}
        </ul>  
        // <MeetupItem></MeetupItem>
    )
}

export default MeetupList