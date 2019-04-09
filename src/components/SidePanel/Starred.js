import React from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../actions';
import firebase from '../../firebase';

class Starred extends React.Component {

	state = {

		starredChannels: [],
		activeChannel: '',
		currentUser: this.props.currentUser,
		usersRef: firebase.database().ref('users')
	}

	componentDidMount() {

		this.addListeners();
	}

	componentWillUnmount() {

		this.removeListeners();
	}

	removeListeners = () => {

		this.state.usersRef.child(`${this.state.currentUser.uid}`)
		.child('starred').off();
	}

	addListeners = () => {
		
		if(this.state.currentUser) {

			this.state.usersRef.child(this.state.currentUser.uid)
			.child('starred')
			.on('child_added', snap => {
				const starredChannel = {id: snap.key, ...snap.val()}
				this.setState({ starredChannels: [...this.state.starredChannels, starredChannel] });
			});
		}

		this.state.usersRef
		.child(this.state.currentUser.uid)
		.child('starred')
		.on('child_removed', snap => {
			const channelToRemove = {id: snap.key, ...snap.val()};
			const filteredChannels = this.state.starredChannels.filter((channel) => {
				return channel.id !== channelToRemove.id;
			});

			this.setState({ starredChannels: filteredChannels })
		});
	};

	displayChannels = starred => 

		starred.length > 0 && starred.map(channel => (

			<Menu.Item
				key={channel.id}
				onClick={() => this.changeChannels(channel)}
				name={channel.name}
				style={{ opacity: 0.7 }}
				active={ channel.id === this.state.activeChannel }
			>	
				# { channel.name }
			</Menu.Item>
		));


	setActiveChannel = (channel) => {

		this.setState({ activeChannel: channel.id })
	};

	changeChannels = channel => {

		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel)
		this.props.setPrivateChannel(false);
	}


	render() {

		const {starredChannels} = this.state;

		return (

		 		<Menu.Menu style={{ paddingButtom: '2em' }}>
				<Menu.Item>
					<span>
						<Icon name="star" /> STARRED
					</span>{"  "}
					({ starredChannels.length })
				</Menu.Item>
				{this.displayChannels(starredChannels)}
			</Menu.Menu>
		);
	}
}



export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);