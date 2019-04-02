import React from 'react';
import {Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {setCurrentChannel} from '../../actions';
class Channels extends React.Component {

	state = {

		user: this.props.currentUser,
		channels: [],
		modal: false,
		channelName: '',
		channelDetails: '',
		channelsRef: firebase.database().ref('channels'),
		firstLoad: true,
		activeChannel: ''
	}

	componentDidMount() {

		this.addListeners();
	}

	componentWillUnmount() {

		this.removeListeners();
	}	

	removeListeners = () => {

		this.state.channelsRef.off();
	}

	addListeners = () => {
		let loadedChannels = [];
		this.state.channelsRef.on('child_added', snap => {
			loadedChannels.push(snap.val());
			console.log(loadedChannels);
			this.setState({ channels: loadedChannels }, () => this.setFirstChannel() );
		});
	}

	setFirstChannel = () => {

		const firstChannel = this.state.channels[0];

		if(this.state.firstLoad && this.state.channels.length > 0) {
			this.setActiveChannel(firstChannel);
			this.props.setCurrentChannel(firstChannel)
		}

		this.setState({ firstLoad: false });
	}

	handleChange = (e) => {

		this.setState({ [e.target.name]: e.target.value })
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	addChannel = () => {

		const { channelsRef, channelName, channelDetails, user } = this.state;

		const key = channelsRef.push().key;

		const newChannel ={

			id: key,
			name: channelName,
			details: channelDetails,
			createdBy: {

				name: user.displayName,
				avatar: user.photoURL
			}
		};

			channelsRef.child(key).update(newChannel).then(() => {
				this.setState({ channelName: '', channelDetails: ''});
				this.closeModal();
			}).catch((e) => {
				console.log(e); 
			});
	};

	handleSubmit = (e) => {

		e.preventDefault();
		if(this.isFormValid(this.state)) {
			this.addChannel();
			console.log('channel Added');
		}
	}

	isFormValid = ({ channelName, channelDetails }) => {

		return channelName.length>0 && channelDetails.length > 0;	
	};

	displayChannels = channels => 

		channels.length > 0 && channels.map(channel => (

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

		setActiveChannel = channel => {

			this.setState({ activeChannel: channel.id });
		}

		changeChannels = channel => {

			this.setActiveChannel(channel)
			this.props.setCurrentChannel(channel)
		}

	render() {

		const {channels, modal} = this.state;

		return (
		  <React.Fragment>
			<Menu.Menu style={{ paddingButtom: '2em' }}>
				<Menu.Item>
					<span>
						<Icon name="exchange" /> CHANNELS
					</span>{"  "}
					({ channels.length }) <Icon name="add" onClick={this.openModal}/>
				</Menu.Item>
					{ this.displayChannels(channels) }
			</Menu.Menu>

			<Modal basic open={modal} onClose={this.closeModal}>
				<Modal.Header>Add a Channel</Modal.Header>
				<Modal.Content>
					<Form onSubmit={this.handleSubmit}>
						<Form.Field>

							<Input 
								fluid
								label="Name of Channel"
								name="channelName"
								onChange={this.handleChange}
							/>

							<Input 
								fluid
								label="About the Channel"
								name="channelDetails"
								onChange={this.handleChange}
							/>

						</Form.Field>
					</Form>
				</Modal.Content>

				<Modal.Actions>
					<Button color="green" inverted onClick={this.handleSubmit}>
						<Icon name="checkmark" /> Add
					</Button>

					<Button color="red" inverted onClick={this.closeModal}>
						<Icon name="remove" /> Cancel
					</Button>
				</Modal.Actions>

			</Modal>
		  </ React.Fragment>
		);
	}
}



export default connect(null, { setCurrentChannel })(Channels);