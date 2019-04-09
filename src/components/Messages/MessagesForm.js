import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuidv4 from 'uuid/v4';
import firebase from '../../firebase';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';
import {Picker, emojiIndex} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

class MessagesForm extends React.Component {

	state = {

		message: '',
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		loading: false,
		errors: [],
		modal: false,
		uploadState: '',
		uploadTask: null,
		storageRef: firebase.storage().ref(),
		percentUploaded: 0,
		typingRef: firebase.database().ref('typing'),
		emojiPicker: false
	}

	componentWillUnmount() {

		if(this.state.uploadTask !== null) {

			this.state.uploadTask.cancel();
			this.setState({ uploadTask: null });
		} 
	}

	handleChange = (e) => {

		this.setState({ [e.target.name]: e.target.value });
	}

	createMessage = (fileUrl = null) => {

		const message = {

			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			}
		};	

		if(fileUrl !== null) {

			message['image'] = fileUrl;
		} else {

			message['content'] = this.state.message;
		}

		return message;
	}

	sendMessage = () => {

		const {getMessagesRef} = this.props;
		const {message, typingRef, user, channel} = this.state;
		if(message) {
			this.setState({ loading: true });

			getMessagesRef().child(channel.id).push().set(this.createMessage()).
			then(() => {

				this.setState({ loading: false, message: '' });
				typingRef.child(channel.id).child(user.uid).remove();

			}).catch((e) => {
				console.log(e);
				this.state({ loading: false, errors: this.state.concat(e) });
			});
		} else {

			this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) });
		}
	}

	openModal = () => this.setState({ modal: true });

	getPath = () => this.props.isPrivateChannel ? `chat/public` : `chat/private-${this.state.channel.id}`;

	getPath = () => {

		if(this.props.isPrivateChannel === true) {

			return `chat/private/${this.state.channel.id}`;
			
		} else {

			return 'chat/public';
		}
	}

	closeModal = () => this.setState({ modal: false });

	uploadFile = (file, metadata) => {
		
		const pathToUpload = this.state.channel.id;
		const ref = this.props.getMessagesRef();
		const filepath = `${this.getPath()}/${uuidv4()}.jpg`;
		this.setState({ upload: 'uploading', 
				uploadTask: this.state.storageRef.child(filepath).put(file, metadata)
			 }, () => {
			 	this.state.uploadTask.on('state_changed', snap => {
			 		 const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
			 		 this.setState({ percentUploaded });
			 	}, err => {
			 		console.log(err);
			 		this.setState({  errors: this.state.errors.concat(err), 
			 						 uploadState: 'error',
			 						 uploadTask: null
			 		});
			 	}, () => {
			 		this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
			 			this.sendFileMessage(downloadUrl, ref, pathToUpload); 
			 		}).catch((e) => {
			 			console.log(e);
			 			this.setState({ errors: this.state.errors.concat(e),
			 						 uploadState: 'error',
			 						 uploadTask: null });
			 		})
			 	})
			 });
	};

	sendFileMessage = (fileUrl, ref, pathToUpload) => {

		ref.child(pathToUpload)
		.push()
		.set(this.createMessage(fileUrl)).then(() => {

			this.setState({ uploadState: 'done' })
		}).catch((e) => {
			console.log(e);
			this.setState({ errors: this.state.errors.concat(e) });
		});
	}

	handleKeyDown = event => {

		if(event.ctrlKey && event.keyCode === 13) {

			this.sendMessage()
		}

		const {message, typingRef, channel, user} = this.state;
		if(message) {

			typingRef.child(channel.id)
			.child(user.uid).set(user.displayName)
		} else {

			typingRef.child(channel.id)
			.child(user.uid).remove();
		}
	}

	handleTogglePicker = () => {

		this.setState({ emojiPicker: !this.state.emojiPicker });

	};	

	handleAddEmoji = emoji => {

		const oldMessage = this.state.message;
		const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
		this.setState({ message: newMessage, emojiPicker: false });
		setTimeout(() => {
			this.messageInputRef.focus()
		}, 0);
	};

	colonToUnicode = message => {

			return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {

				x = x.replace(/:/g, "");
				let emoji = emojiIndex.emojis[x];
				if(typeof emoji !== "undefined") {
					let unicode = emoji.native;
					if(typeof unicode !== "undefined") {
						return unicode
					}
				}

				x = ":" + x + ":";
				return x;
			});
	}

	render() {

		const {errors, message, loading,uploadState, percentUploaded, emojiPicker} = this.state;

		return (

			<Segment className="message__form">
			{ emojiPicker && (
				<Picker 
					set="apple"
					onSelect={this.handleAddEmoji}
					className="emojipicker"
					title="Pick emoji's"
					emoji="point_up"
				/>
			)}
				<Input 
					fluid
					name="message"
					onKeyDown={this.handleKeyDown}
					onChange={this.handleChange}
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} onClick={this.handleTogglePicker}/>}
					className={ 
						errors.some(error => error.message.includes('message')) ? 'error' : '' 
					}
					value={message}
					placeholder="Write your message"
					ref={node => (this.messageInputRef = node)}
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
					disabled={uploadState === 'uploading'}
					labelPosition="right"
					icon="cloud upload"
				/>
				</Button.Group>
					<FileModal modal={this.state.modal}
					closeModal = {this.closeModal}
					uploadFile = {this.uploadFile}
				/>
				<ProgressBar 
					uploadState = {uploadState}
					percentUploaded = {percentUploaded}
				/>
			</Segment>

		);
	}
}

export default MessagesForm;