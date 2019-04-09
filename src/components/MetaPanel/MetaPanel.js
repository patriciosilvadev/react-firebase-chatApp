import React from 'react';
import {Segment, Accordion, Header, Icon, Image} from 'semantic-ui-react';

class MetaPanel extends React.Component {

	state = {

		activeIndex: 0,
		privateChannel: this.props.isPrivateChannel,
		currentChannel: this.props.currentChannel
	};

	setActiveIndex = (e, titleProps) => {

		const {index} = titleProps;
		const {activeIndex} = this.state;
		const newIndex = activeIndex === index ? -1 : index;
		this.setState({ activeIndex: newIndex });
	};

	render () {

		const {activeIndex, privateChannel, currentChannel} = this.state;

		if(privateChannel || !currentChannel) return null;

		return (

			<Segment>
				<Header as="h3" attached="top">
					About # {currentChannel.name}
				</Header>
				<Accordion styled attached="true">
					<Accordion.Title
						active={activeIndex === 0}
						index={0}
						onClick={this.setActiveIndex}
					>
						<Icon name="dropdown"/>
						<Icon name="info"/>
						Channel Details
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 0}>
						{currentChannel.details}
					</Accordion.Content>

					<Accordion.Title
						active={activeIndex === 1}
						index={1}
						onClick={this.setActiveIndex}
					>
						<Icon name="dropdown"/>
						<Icon name="user circle"/>
						Top Posters
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 1}>
						Posters
					</Accordion.Content>


					<Accordion.Title
						active={activeIndex === 2}
						index={2}
						onClick={this.setActiveIndex}
					>
						<Icon name="dropdown"/>
						<Icon name="pencil alternate"/>
						Created By
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 2}>
						<Header as="h3">
							<Image circular src={currentChannel.createdBy.avatar}/>
							{currentChannel.createdBy.name}	
						</Header>
						
					</Accordion.Content>

				</Accordion>
			</Segment>
		);
	}
}

export default MetaPanel;