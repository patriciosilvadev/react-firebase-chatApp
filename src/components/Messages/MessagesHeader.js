import React from 'react';
import {Header, Segment, Icon, Input} from 'semantic-ui-react';
class MessagesHeader extends React.Component {


	render() {

		const {channelName, numUniqueUsers, handleSearchChange, loading, isPrivateChannel, handleStar, isChannelStarred} = this.props;

		return (

			<Segment clearing>

				<Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
					<span>
						{channelName}
						{!isPrivateChannel && <Icon 
							onClick={handleStar} name={isChannelStarred ? 'star' : 'star outline'} 
							color={isChannelStarred ? 'yellow' : 'black'} />}
					</span>
					<Header.Subheader>{numUniqueUsers}</Header.Subheader>
				</Header>

				
				<Header floated="right">
					<Input
						size="mini"
						loading={loading}
						icon="search"
						onChange={handleSearchChange}
						name="searchTerm"
						placeholder="Search Messages"
					/>
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;