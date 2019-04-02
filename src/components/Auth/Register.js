import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component {

	state ={

		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		errors: [],
		loading: false,
		userRef: firebase.database().ref('users')	 
	};

	handleChange = (e) => {

		this.setState({
			[e.target.name]: e.target.value
		});
	};

	isFormValid = () => {

		let errors = [];
		let error;

		if(this.isFormEmpty(this.state)) {

			error = { message: 'Fill in all fields!' };
			this.setState({ errors: errors.concat(error) });
			return false;

		} else if(!this.isPasswordValid(this.state)) {
			error = { message: 'Password is invalid' };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else {

			return true;
		}
	};

	dispalyErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

	isFormEmpty = ({ username, email, password, passwordConfirmation }) => {

		return !username.length || !email.length || !password.length || !passwordConfirmation.length;
	}

	isPasswordValid = ({ password, passwordConfirmation }) => {

		if(password.length < 6 || passwordConfirmation.length < 6) {
			return false;
		} else if(password !== passwordConfirmation) {
			return false;
		} else {
			return true;
		}
	};

	handleSubmit = (e) => {
		e.preventDefault();
		if(this.isFormValid()) {

			this.setState({ errors: [], loading: true })
			firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then((createdUser) => {
				console.log(createdUser); 
				createdUser.user.updateProfile({
					displayName: this.state.username,
					photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
				}).then(() => {
					this.saveUser(createdUser).then(() => {
						this.setState({ loading: false });
						console.log('user saved');
					}).catch((e) => {
						console.log(e);
						this.setState({ errors: this.state.errors.concat(e), loading: false });
					});

				}).catch((e) => {
					console.log(e);
					this.setState({ errors: this.state.errors.concat(e), loading: false });
				});
			}).catch((e) => {
				console.log(e);
				this.setState({ errors: this.state.errors.concat(e), loading: false });
			});
		}	
	}

	saveUser = (createdUser) => {

		 return this.state.userRef.child(createdUser.user.uid).set({
		 	name: createdUser.user.displayName,
		 	avatar: createdUser.user.photoURL
		 });
	};

	render() {

		const {username, password, passwordConfirmation, email, loading, errors} = this.state 

		return (

			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h2" icon color="orange" textAlign="center">
						<Icon name="fire" color="red"/>
							Register for G-NET
					</Header>
					<Form size="large" onSubmit={this.handleSubmit}>
						<Segment stacked>
							<Form.Input 
								fluid  
								type="text" 
								name="username" 
								icon="user" 
								iconPosition="left"
								placeholder="Username" 
								value={username}
								className={errors.some(error => error.message.toLowerCase().includes('username')) ? 'error' : ''}
								onChange={this.handleChange} />

							<Form.Input 
								fluid  
								type="email" 
								name="email" 
								icon="mail" 
								iconPosition="left" 
								placeholder="Email" 
								value={email}
								className={errors.some(error => error.message.toLowerCase().includes('email')) ? 'error' : ''}
								onChange={this.handleChange} />

							<Form.Input 
								fluid  
								type="password" 
								name="password" 
								icon="lock" 
								iconPosition="left" 
								placeholder="Password" 
								value={password}
								className={errors.some(error => error.message.toLowerCase().includes('password')) ? 'error' : ''}
								onChange={this.handleChange} />
							
							<Form.Input 
								fluid  
								type="password" 
								name="passwordConfirmation"
								icon="repeat" 
								iconPosition="left" 
								placeholder="Password Confirmation"
								value={passwordConfirmation} 
								className={errors.some(error => error.message.toLowerCase().includes('passwordConfirmation')) ? 'error' : ''}
								onChange={this.handleChange} />
							
							<Button 
								color="red" 
								fluid size="large"
								className={loading ? 'loading' : ''}
								disabled={loading} >
								Submit
								</Button>

						</Segment>
					</Form>
					{this.state.errors.length > 0 && (
						<Message error>
						<h3>Error</h3>
						{this.dispalyErrors(this.state.errors)}
						</ Message >
					)}
					<Message>Already a user? <Link to="/login">Login</Link> </Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Register;