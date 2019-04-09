import React from 'react';
import {Grid, Icon, Header, Dropdown, Image, Modal, Input, Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor'; 

class UserPanel extends React.Component {

	state = {

		user: this.props.currentUser,
		modal: false,
		file: null,
		previewImage: '',
		croppedImage: '',
		blob: '',
		storageRef: firebase.storage().ref(),
		userRef: firebase.auth().currentUser,
		metadata: {
			content: 'image/jpeg'
		},	
		uploadedCroppedImage: '',
		usersRef: firebase.database().ref('users')
	}

	dropdownOptions = () => [

		{	
			key: 'user',
			text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
			disabled: true
		},

		{
			key: 'avatar',
			text: <span onClick={this.openModal}>Change Avatar</span>,
		},

		{
			key: 'signout',
			text: <span onClick={this.handleSignout}>Sign Out</span>
		}
	];

	uploadCroppedImage = (e) => {

		const { croppedImage, blob, storageRef, userRef, metadata, uploadedCroppedImage } = this.state;
		storageRef.child(`avatars/user/${userRef.uid}`)
		.put(blob, metadata).then(snap => {

			 snap.ref.getDownloadURL().then((downloadURL) => {
			 	this.setState({ uploadedCroppedImage: downloadURL }, () => {
			 		this.changeAvatar();
			 	});
			 })
		})
	};

	changeAvatar = () => {

		this.state.userRef.updateProfile({
			photoURL: this.state.uploadedCroppedImage
		}).then(() => {
			console.log('photo url updated');
			this.closeModal();
		}).catch((e) => {
			console.log(e);
		})

		this.state.usersRef
		.child(this.state.userRef.uid)
		.update({ avatar: this.state.uploadedCroppedImage }).then(() => {

			console.log('User avatar updated')
		}).catch((e) => {
			console.log(e);
		});
	};

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	handleChange = (e) => {

		const file = e.target.files[0];
		const reader = new FileReader();
		
		if (file) {

			reader.readAsDataURL(file);
			reader.addEventListener('load', () => {
				this.setState({ previewImage: reader.result });
			});
		}
	};

	handleCropImage = () => {
 
		if(this.avatarEditor) {

			this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {

				let imageUrl = URL.createObjectURL(blob);
				this.setState({

					croppedImage: imageUrl,
					blob
				});
			})
		}
	}

	handleSignout = () => {

		firebase.auth().signOut().then(() => {
			console.log('Signed Out');
		})
	};

	render() {

		const {user, modal, previewImage, croppedImage} = this.state;

		return (

			<Grid style={{ background: '#404369' }}>
				<Grid.Column>
					<Grid.Row style={{ padding: '1.2em', margin: 0 }}>

						 <Header inverted floated="left" as="h2">
						 	<Icon name="leaf"/>
						 	<Header.Content>G-NET</Header.Content>
						 </Header>

						 	<Header style={{ padding: '0.25em' }} as="h4" inverted>
						<Dropdown trigger = {
							<span>
								<Image src={user.photoURL} spaced="right" avatar />
								{user.displayName}
							</span>
						} options={this.dropdownOptions()}/>
					</Header>

					</Grid.Row>

					<Modal basic open={modal} onClose={this.closeModal}>
						<Modal.Header>Change Avatar</Modal.Header>
						<Modal.Content>
							
							<Input 
								onChange={this.handleChange}
								fluid
								type="file"
								label="New Avatar"
								name="previewImage"
								onChange={this.handleChange}
							/>

							<Grid centered stackable columns={2}>
								<Grid.Row centered>
									<Grid.Column className="ui center aligned grid">

									{previewImage && (

											<AvatarEditor
												ref={node => (this.avatarEditor = node)} 
												image={previewImage}
												width={180}
												heigth={180}
												border={50}
												scale={2.2}
											/>
										)}

									</Grid.Column>
									<Grid.Column>

										{croppedImage && (

											<Image 
												style={{ margin: '3.5em auto' }}
												width={180}
												heigth={180}
												src={croppedImage}
											/>
										)}

									</Grid.Column>
								</Grid.Row>
							</Grid>

						</Modal.Content>

						<Modal.Actions>

							{croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
								<Icon name="save" /> Change Avatar
							</Button>}

							<Button color="green"inverted onClick={this.handleCropImage}>
									<Icon name="image" /> Preview
							</Button>

							<Button color="red"inverted onClick={this.closeModal}>
									<Icon name="remove" /> Cancel
							</Button>

						</Modal.Actions>

					</Modal>

				</Grid.Column>
			</Grid>

		);
	}
}


export default UserPanel;