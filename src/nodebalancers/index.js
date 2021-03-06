import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NodeBalancersList from './layouts/NodeBalancersList';
import NodeBalancerIndex from './nodebalancer';
import Configs from './nodebalancer/configs';

const NodeBalancersIndex = (props) => {
  const { match: { path } } = props;
  return (
    <Switch>
      <Route component={Configs} path={`${path}/:nbLabel/configs`} />
      <Route component={NodeBalancerIndex} path={`${path}/:nbLabel`} />
      <Route component={NodeBalancersList} exact path={`${path}/`} />
      <Redirect to="/not-found" />
    </Switch >
  );
};

NodeBalancersIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default NodeBalancersIndex;
