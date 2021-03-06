import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import ConfirmModalBody from 'linode-components/dist/modals/ConfirmModalBody';
import Table from 'linode-components/dist/tables/Table';
import DropdownCell from 'linode-components/dist/tables/cells/DropdownCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import ThumbnailCell from 'linode-components/dist/tables/cells/ThumbnailCell';
import EmitEvent from 'linode-components/dist/utils/EmitEvent';

import { hideModal, showModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import api from '~/api';
import { resetSecret } from '~/api/ad-hoc/clients';
import { transform } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { API_ROOT } from '~/constants';
import { DefaultClientThumb } from '~/assets';
import { confirmThenDelete } from '~/utilities';

import { renderSecret } from '../components/CreatePersonalAccessToken';
import CreateOrEditApplication from '../components/CreateOrEditApplication';
import { ComponentPreload as Preload } from '~/decorators/Preload';

const OBJECT_TYPE = 'clients';

export class MyAPIClientsPage extends Component {
  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  clientLabel(client) {
    return client.client ? client.client.label : client.label;
  }

  createDropdownGroups = (client) => {
    const { dispatch } = this.props;
    const editClient = { ...client, forEdit: true };
    const groups = [
      { elements: [{ name: 'Edit', action: () =>
        CreateOrEditApplication.trigger(dispatch, editClient) }] },
      { elements: [{ name: 'Reset Secret', action: () => this.resetAction(editClient) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteClients(editClient) }] },
    ];
    return groups;
  }

  deleteClients = confirmThenDelete(
    this.props.dispatch,
    'client',
    api.clients.delete,
    OBJECT_TYPE).bind(this)

  resetAction = (client) => {
    const { dispatch } = this.props;
    const title = 'Reset Client Secret';

    return dispatch(showModal(title,
      <ConfirmModalBody
        onCancel={() => {
          EmitEvent('modal:cancel', 'Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        onSubmit={async () => {
          const { secret } = await dispatch(resetSecret(client.id));

          EmitEvent('modal:submit', 'Modal', 'reset', title);
          return dispatch(renderSecret(
            'client secret', 'reset', secret, () => dispatch(hideModal())));
        }}
      >
        Are you sure you want to reset <strong>{client.label}</strong>&apos;s secret?
      </ConfirmModalBody>
    ));
  }

  thumbnailSrc(client) {
    if (client.thumbnail_url) {
      return API_ROOT.concat(client.thumbnail_url);
    }
    return DefaultClientThumb;
  }

  renderClients = () => {
    const { dispatch, selectedMap, clients: { clients } } = this.props;
    const { filter } = this.state;

    const { sorted: sortedClients } = transform(clients, {
      filterBy: filter,
      sortBy: t => this.clientLabel(t).toLowerCase(),
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedClients}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteClients },
              ] }]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: ThumbnailCell,
                headerClassName: 'ThumbnailColumn',
                srcFn: this.thumbnailSrc,
              },
              {
                dataFn: this.clientLabel,
                tooltipEnabled: true,
                label: 'Label',
              },
              { label: 'Access', dataFn: (client) => client.public ? 'Public' : 'Private' },
              { dataKey: 'id', label: 'ID' },
              { dataKey: 'redirect_uri', label: 'Redirect URI', className: 'u-hscroll-overflow' },
              {
                cellComponent: DropdownCell,
                headerClassName: 'DropdownColumn',
                groups: this.createDropdownGroups,
              },
            ]}
            noDataMessage="No clients found."
            data={sortedClients}
            selectedMap={selectedMap}
            onToggleSelect={(client) => dispatch(toggleSelected(OBJECT_TYPE, client.id))}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch } = this.props;

    return (
      <div>
        <ChainedDocumentTitle title="My API Clients" />
        <header className="NavigationHeader clearfix">
          <PrimaryButton
            onClick={() => CreateOrEditApplication.trigger(dispatch)}
            className="float-right"
            buttonClass="btn-secondary"
          >Create an OAuth Client</PrimaryButton>
        </header>
        {this.renderClients()}
      </div>
    );
  }
}

MyAPIClientsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  clients: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    clients: state.api.clients,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
};

const preloadRequest = async (dispatch) => {
  await dispatch(api.clients.all());
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(MyAPIClientsPage);
