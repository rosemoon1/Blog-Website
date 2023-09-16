import {NavLink} from "react-router-dom";
//could have used link also but navlink se
//styling is asan coz default props
import styles from './Navbar.module.css';
import { useSelector } from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";
import { useDispatch } from "react-redux";
function Navbar() {
    const dispatch = useDispatch();
    const isAuthenticated =false;
    const handleSignout = async()=>{
        await signout();
        dispatch(resetUser());
    };
    return(
        <>
            <nav className={styles.navbar}>
                <NavLink to='/' 
                className={`${styles.logo} ${styles.inActiveStyle}`}>
                    Blog Website</NavLink>
                <NavLink to='/'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}
                >
                    Home</NavLink>
                <NavLink to='table'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}>
                    Table</NavLink>
                <NavLink to='blogs'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}>
                    Blogs</NavLink>
                <NavLink to='submit'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}>
                    Submit</NavLink>
                {isAuthenticated ? 
                <div>
                    <NavLink>
                        <button className ={styles.signOutButton} onClick={handleSignout}>
                            Sign out</button>
                    </NavLink>
                </div>
                 : <div><NavLink to='login'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}>
                    <button className={styles.logInButton}>Log In</button></NavLink>
                <NavLink to='signup'
                className={({isActive})=> isActive ? styles.activeStyle : styles.inactiveStyle}>
                    <button className={styles.signUpButton}>Sign Up</button></NavLink>
                    </div>}
            </nav> 
            <div className={styles.separator}></div>
        </>
    );
}
export default Navbar;