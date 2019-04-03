import React from 'react';
import {Modal, Input, Button, Icon} from 'semantic-ui-react';
import mime from 'mime-type'
class FileModal extends React.Component {

	state = {
		file: null,
		authorized: ['image/jpeg', 'image/png']
	}

	addFile = e => {

		const file = e.target.files[0];
		if(file) {
			this.setState({ file });
		}
	}

	sendFile = () => {

		const {file, closeModal} = this.state;
		const {uploadFile} = this.props;
		if(file !== null) {
			if(this.isAuthorized(file.name)) {
				const metadata = { contentType: mime.lookup(file.name) };
				uploadFile(file, metadata);
				closeModal();
				this.clearFile();
			}
		}
	}

	clearFile = () => this.setState({file: null});

	isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename));

	render() {

		const {modal, closeModal} = this.props;

		return (

			<Modal basic open={modal} onClose={closeModal}>
				<Modal.Header>
					<Modal.Content>
						<Input 
							fluid
							onChange={this.addFile}
							label="File"
							name="file"
							type="file"
						/>
					</Modal.Content>
				</Modal.Header>
							<Modal.Actions>

							<Button 
								color="green"
								inverted
								onClick={this.sendFile}
							>
								<Icon name="checkmark" /> Send File
							</Button>

							<Button 
								color="red"
								inverted
								onClick={closeModal}
							>
								<Icon name="remove" />Cancel
							</Button>
						</Modal.Actions>
			</Modal>
		);
	}
}

export default FileModal;