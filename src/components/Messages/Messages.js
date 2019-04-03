import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessagesForm from './MessagesForm';
import Message from './Message';
import firebase from '../../firebase';

class Messages extends React.Component {

	state = {
		messagesRef: firebase.database().ref('messages'),
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		messagesLoading: true,
		messages: []
	}

	componentDidMount() {

		const {channel, user} = this.state;
		if(channel && user) {

			this.addListener(channel.id);
		}
	}

	addListener = channelId => {

		this.addMessageListener(channelId);
	}

	addMessageListener = channelId => {

		let loadedMessages = [];
		this.state.messagesRef.child(channelId).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
		});
	}

	displayMessages = messages => 

		messages.length > 0 && messages.map(message => (

			<Message 
				key={message.timestamp}
				message={message}
				user={this.state.user}
			/>				
		));	

	render() 
	{
		const {messagesRef, channel, user, messages} = this.state;

		return (

			<React.Fragment>
				<MessagesHeader />

				<Segment>
					<Comment.Group classname="messages">
						{this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
 
				<MessagesForm 
					 currentChannel = {channel}
					 currentUser = {user}
					 messagesRef={messagesRef}
				 />
			</React.Fragment>
		);
	}
}

export default Messages;