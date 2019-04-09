import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessagesForm from './MessagesForm';
import Message from './Message';
import firebase from '../../firebase';
import Typing from './Typing';

class Messages extends React.Component {

	state = {
		messagesRef: firebase.database().ref('messages'),
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		messagesLoading: true,
		messages: [],
		numUniqueUsers: '',
		searchTerm: '',
		searchLoading: false,
		searchResults: [],
		privateChannel: this.props.isPrivateChannel,
		privateMessagesRef: firebase.database().ref('privateMessages'),
		isChannelStarred: false,
		usersRef: firebase.database().ref('users'),
		typingRef: firebase.database().ref('typing'),
		typingUsers: [],
		connectedRef: firebase.database().ref('.info/connected'),
		listeners: []
	}

	componentDidMount() {

		const {channel, user, listeners} = this.state;
		if(channel && user) {
			this.removeListeners(listeners);
			this.addListener(channel.id);
			this.addUserStarsListener(channel.id, user.uid);
		}
	}

	componentWillUnmount() {

		this.removeListeners(this.state.listeners);
		this.state.connectedRef.off();
	}

	removeListeners = listeners => {

		listeners.forEach(listener => {
			listener.ref.child(listener.id).off(listener.event);
		});
	};

	addToListeners = (id, ref, event) => {

		const index = this.state.listeners.findIndex(listener => {

			return listener.id === id && listener.ref === ref && listener.event === event;
		});

		if(index !== -1) {

			const newListener = { id, ref, event };
			this.setState({ listeners: this.state.listeners.concat(newListener) });
		}
	}

	componentDidUpdate(prevProps, prevState) {

		if(this.messagesEnd) {
			this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
		}
	}

	addListener = channelId => {

		this.addMessageListener(channelId);
		this.addTypingListener(channelId);
	}

	addMessageListener = channelId => {

		let loadedMessages = [];
		const ref = this.getMessagesRef();
		ref.child(channelId).on('child_added', snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
		});
		this.countUniqueUsers(loadedMessages);
		this.addToListeners(channelId, ref, 'child_added');
	}

	addUserStarsListener = (channelId, userId) => {
		this.state.usersRef.child(userId)
		.child('starred')
		.once('value')
		.then(data => {

			if(data.val() !== null) {
				var isStarred = false;
				for(var key in data.val()) {
					if(data.val().hasOwnProperty(key)) {
						if(key === channelId) {
							isStarred = true;
							break;
						} else {
							isStarred = false;
						}
					}
				}

				this.setState({ isChannelStarred: isStarred });
			}
		})
	};

	countUniqueUsers = loadedMessages => {

		const uniqueUsers = loadedMessages.reduce((acc, message) => {

			if(!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);

		const numUniqueUsers = `${uniqueUsers.length} users`;
		this.setState({ numUniqueUsers: numUniqueUsers });
	};

	displayMessages = messages => 

		messages.length > 0 && messages.map(message => (

			<Message 
				key={message.timestamp}
				message={message}
				user={this.state.user}
			/>				
		));	

	 displayChannelName = channel => {

	 	return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
	 };

	 handleSearchChange = (e) => {

	 	this.setState({ searchTerm: e.target.value, searchLoading: true }, () => {
	 		this.handleSearchMessages();
	 	});

	 }

	 getMessagesRef = () => {

	 	const {messagesRef, privateMessagesRef, privateChannel} = this.state;
	 	return privateChannel ? privateMessagesRef : messagesRef;
	 }

	 handleSearchMessages = () => {

	 	const channelMessages = [...this.state.messages];
	 	const regex = new RegExp(this.state.searchTerm, 'gi');
	 	const searchResults = channelMessages.reduce((acc, message) => {

	 		if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
	 			acc.push(message);
	 		}
	 		return acc;
	 	}, []);

	 	this.setState({ searchResults });
	 	setTimeout(() => this.setState({ searchLoading: false }), 1000);
	 }

	 handleStar = () => {

	 	this.setState(prevState => ({

	 		isChannelStarred: !prevState.isChannelStarred
	 	}), () => {

	 		this.starChannel();
	 	});
	 };

	 starChannel = () => {

	 	if(this.state.isChannelStarred) {

	 		this.state.usersRef.child(`${this.state.user.uid}/starred`)
	 		.update({

	 			[this.state.channel.id]: {

	 				name: this.state.channel.name,
	 				details: this.state.channel.details,
	 				createdBy: {
	 					name: this.state.channel.createdBy.name,
	 					avatar: this.state.channel.createdBy.avatar
	 				}
	 			}
	 		});

	 	} else {

	 		this.state.usersRef.child(`${this.state.user.uid}/starred`)
	 		.child(this.state.channel.id)
	 		.remove(err => {
	 			if(err !== null) {

	 				console.log(err);
	 			}
	 		})
	 	}
	 };

	 countUserPosts = messages => {

	 	let userPosts = messages.reduce((acc, message) => {
	 		if(message.user.name in acc) {
	 			acc[message.user.name].count += 1;
	 		} else {
	 			acc[messages.user.name] = {

	 				avatar: message.user.avatar,
	 				count: 1
	 			};
	 		}

	 		return acc;

	 	}, {});

	 	console.log(userPosts);	
	 }

	 addTypingListener = channelId => {

	 	let typingUsers = [];
	 	this.state.typingRef.child(channelId).on('child_added', snap => {
	 		if(snap.key !== this.state.user.uid) {

	 			typingUsers = typingUsers.concat({

	 				id: snap.key,
	 				name: snap.val()
	 			})

	 			this.setState({ typingUsers });
	 		}	
	 	});

	 	this.addToListeners(channelId, this.state.typingRef, 'child_added');	

	 	this.state.typingRef.child(channelId).on('child_removed', snap => {
			
			const index = typingUsers.findIndex(user => user.id === snap.key);
			if(index !== -1) {

				typingUsers = typingUsers.filter(user => user.id !== snap.key);
				this.setState({ typingUsers });
			}
	 	});

	 	this.addToListeners(channelId, this.state.typingRef, 'child_removed');

	 	this.state.connectedRef.on('value', snap => {

	 		if(snap.val() === true) {

	 			this.state.typingRef
	 			.child(channelId)
	 			.child(this.state.user.uid)
	 			.onDisconnect()
	 			.remove(err => {

	 				if(err !== null) {

	 					console.log(err);
	 				}
	 			});
	 		}
	 	});
	 };

	 displayTypingUsers = (typing) => (

		typing.length>0 && typing.map(user => (

			<div key={user.id} style={{ display: 'flex' , alignItems: 'center', marginBottom: '0.2em'}}>
				<span className="user__typing">{user.name} is typing</span> <Typing />
			</div>
		))
	 );

	render()	 

	 {
		const {messagesRef, channel, user, messages, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, typingUsers} = this.state;

		return (

			<React.Fragment>
				<MessagesHeader 
					channelName={this.displayChannelName(channel)}
					numUniqueUsers = {numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					loading={searchLoading}
					isPrivateChannel={privateChannel}
					handleStar={this.handleStar}
					isChannelStarred={this.state.isChannelStarred}
				/>

				<Segment>
					<Comment.Group className="messages">
						{searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
					{this.displayTypingUsers(typingUsers)}
					<div ref={node => (this.messagesEnd = node)}></div>
					</Comment.Group>
				</Segment>
 
				<MessagesForm 
					 currentChannel = {channel}
					 currentUser = {user}
					 messagesRef={messagesRef}
					 isPrivateChannel={privateChannel}
					 getMessagesRef={this.getMessagesRef}
				 />
			</React.Fragment>
		);
	}
}

export default Messages;