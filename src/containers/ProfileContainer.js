// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

// import selectors from 'state/selectors';

import Profile from '../components/ProfileStatic';

const mapStateToProps = (state,ownProps) => {

   let userID = state.ui.userID
   
   let profile = state.data.resources
   if(profile && userID) profile = profile[userID]
   if(profile) profile = profile[userID]
   else profile = null

   let dictionary = state.data.dictionary ;

   let props = { userID, profile, dictionary }

   return props

};


const ProfileContainer = connect(
    mapStateToProps
)(Profile);

export default ProfileContainer;
