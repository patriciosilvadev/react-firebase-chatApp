import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';

class MessagesForm extends React.Component {

	state = {

		message: '',
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		loading: false,
		errors: [],
		modal: false
	}

	handleChange = (e) => {

		this.setState({ [e.target.name]: e.target.value });
	}

	createMessage = () => {

		const message = {

			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			},
			content: this.state.message,
		};	
		return message;
	}

	sendMessage = () => {

		const {messagesRef} = this.props;
		const {message, channel} = this.state;
		if(message) {
			this.setState({ loading: true });

			messagesRef.child(channel.id).push().set(this.createMessage()).
			then(() => {
				this.setState({ loading: false, message: '' })
			}).catch((e) => {
				console.log(e);
				this.state({ loading: false, errors: this.state.concat(e) });
			});
		} else {

			this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) });
		}
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	uploadFile = (file, metadata) => {
		console.log(file.name);
	};

	render() {

		const {errors, message, loading} = this.state;

		return (

			<Segment className="message__form">
				<Input 
					fluid
					name="message"
					onChange={this.handleChange}
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} />}
					className={ 
						errors.some(error => error.message.includes('message')) ? 'error' : '' 
					}
					value={message}
					placeholder="Write your message"
				/>
				<Button.Group icon widths="2">
					<Button
						onClick={this.sendMessage}
						color="green"
						disabled={loading}
						content="Add Reply"
						labelPosition="left"
						icon="edit"
					/>
				<Button 
					color="teal"
					onClick={this.openModal}
					content="Upload Media"
					labelPosition="right"
					icon="cloud upload"
				/>

				<FileModal modal={this.state.modal}
					closeModal = {this.closeModal}
					uploadFile = {this.uploadFile}
				/>

				</Button.Group>
			</Segment>

		);
	}
}

export default MessagesForm;