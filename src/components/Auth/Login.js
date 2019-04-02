import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component {

	state ={

		email: '',
		password: '',
		errors: [],
		loading: false,	 
	};

	handleChange = (e) => {

		this.setState({
			[e.target.name]: e.target.value
		});
	};

	dispalyErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);


	handleSubmit = (e) => {
		e.preventDefault();
		
		if(this.isFormValid(this.state)) {

			this.setState({ errors: [], loading: true });
			firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).
			then((signedInUser) => {
				console.log(signedInUser);
			}).catch((e) => {
				console.log(e);
				this.setState({ errors: this.state.errors.concat(e), loading: false });
			});
		}	
	}

	isFormValid = ({ email, password }) => {

		return email.length>0 && password.length>0;
	};

	render() {

		const {password, email, loading, errors} = this.state ;

		return (

			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h2" icon color="green" textAlign="center">
						<Icon name="leaf" color="green"/>
							Login to G-NET
					</Header>
					<Form size="large" onSubmit={this.handleSubmit}>
						<Segment stacked>
							

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
							
							
							<Button 
								color="green" 
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
					<Message>Don't have an account? <Link to="/register">Register</Link> </Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Login;