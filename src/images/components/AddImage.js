import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ModalFormGroup from 'linode-components/dist/forms/ModalFormGroup';
import Input from 'linode-components/dist/forms/Input';
import Textarea from 'linode-components/dist/forms/Textarea';
import Select from 'linode-components/dist/forms/Select';
import { onChange } from 'linode-components/dist/forms/utilities';
import FormModalBody from 'linode-components/dist/modals/FormModalBody';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import LinodeSelect from '~/linodes/components/LinodeSelect';


export default class AddImage extends Component {
  static title = 'Create Image from Disk'

  static trigger(dispatch, linodes, linode, disk) {
    return dispatch(showModal(AddImage.title, (
      <AddImage
        dispatch={dispatch}
        linodes={linodes}
        linode={linode}
        disk={disk}
        title={AddImage.title}
      />
    )));
  }

  constructor(props) {
    super(props);
    const { linode, linodes, disk } = props;

    this.state = {
      linode,
      linodes,
      disk: disk || 1,
      allDisks: {},
      disks: false,
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  onLinodeChange = async (e) => {
    const { allDisks } = this.state;
    const linodeId = e.target.value;

    this.onChange(e);

    if (linodeId === LinodeSelect.EMPTY) {
      return;
    }

    this.setState({ disk: 1 });

    let linodeDisks = allDisks[linodeId];
    if (!allDisks[linodeId]) {
      this.setState({ loading: true });
      const disks = await this.props.dispatch(api.linodes.disks.all([linodeId]));
      linodeDisks = Object.values(disks.data)
        .map(
          disk => ({
            label: disk.label,
            value: disk.id,
            size: disk.size,
            filesystem: disk.filesystem,
          })
        );
      this.setState({
        loading: false,
        allDisks: { ...allDisks, [linodeId]: linodeDisks },
      });
    }

    const { diskOptions } = this.disksByType(linodeDisks);
    this.setState({
      disk: diskOptions.length ? diskOptions[0].value : 1,
    });
  }

  onSubmit = () => {
    const { description, label, disk } = this.state;
    const { dispatch } = this.props;

    const diskId = disk.id || disk;

    const requests = [
      () => api.images.post({ disk_id: diskId, label, description }),
      hideModal,
    ];

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  disksByType = disks => {
    const rawDisks = disks.filter(disk => disk.filesystem === 'raw');
    const swapDisks = disks.filter(disk => disk.filesystem === 'swap');
    const regularDisks = disks.filter(disk => ['ext3', 'ext4'].indexOf(disk.filesystem) > -1);
    const initDisks = disks.filter(disk => disk.filesystem === 'ext2');
    const diskOptions = [...regularDisks, ...initDisks];
    return {
      rawDisks: rawDisks,
      swapDisks: swapDisks,
      regularDisks: regularDisks,
      initDisks: initDisks,
      diskOptions: diskOptions,
    };
  }

  isSimpleLinode = disks => {
    // A "Simple Linode" has two disks: one ext3 or ext4 disk and one swap disk
    const regularCount = disks.filter(
      disk => ['ext3', 'ext4'].indexOf(disk.filesystem) > -1).length;
    const swapCount = disks.filter(
      disk => disk.filesystem === 'swap').length;
    return disks.length === 2 && regularCount === 1 && swapCount === 1;
  }

  renderDiskOptions = (disks, currentDisk, fromDisk) => {
    const { rawDisks, swapDisks, diskOptions } = this.disksByType(disks);

    const diskField = diskOptions.length ?
      /* UX request:
        If a Linode is not a "Simple Linode" but it only has one option,
        still show the select field!
      */
      <Select
        options={diskOptions} value={currentDisk} name="disk" id="disk" onChange={this.onChange}
      />
      /* UX request:
        Show a disabled input field when creating an image from a disk.

        Also, if a Linode is not a "Simple Linode" but it has no options, e.g. the
        linode has no disks (or only raw or swap disks) then show a disabled
        input field with the value "None". This indicates to the customer
        that they _could_ choose disks if they modify their Linode's config.
      */
      : <Input name="disk" value={(fromDisk && fromDisk.label) || 'None'} disabled />;

    const helpText = (diskOptions.length === 0 && (rawDisks.length > 0 || swapDisks.length > 0)) ?
      <small id="help-raw" className="text-muted">
        Cannot create images from raw disks or swap volumes.
      </small>
      : null;

    return (
      <ModalFormGroup label="Disk" id="disk" apiKey="disk">
        {diskField}
        {helpText}
      </ModalFormGroup>
    );
  }

  render() {
    const { dispatch, disk: fromDisk } = this.props;
    const {
      label, description, errors, linode, linodes,
      disk: currentDisk, allDisks, loading } = this.state;
    const disks = allDisks[linode] || [];
    const isSimpleLinode = this.isSimpleLinode(disks);

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={() => dispatch(hideModal())}
        buttonText="Create Image"
        analytics={{ title: AddImage.title }}
        errors={errors}
      >
        <div>
          {linodes ?
            <ModalFormGroup label="Linode" id="linode">
              <LinodeSelect
                linodes={linodes.linodes}
                value={linode}
                name="linode"
                id="linode"
                onChange={this.onLinodeChange}
              />
              <small className="text-muted">
                Disk usage may not exceed 2048 MB.
              </small>
            </ModalFormGroup>
            : null}
          {(!loading && !isSimpleLinode) && this.renderDiskOptions(disks, currentDisk, fromDisk)}
          <ModalFormGroup errors={errors} id="label" label="Label" apiKey="label">
            <Input
              id="label"
              name="label"
              placeholder="Label"
              value={label}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          <ModalFormGroup errors={errors} id="description" label="Description" apiKey="description">
            <div>
              <Textarea
                value={description}
                onChange={this.onChange}
                id="description"
                name="description"
              />
            </div>
          </ModalFormGroup>
        </div>
      </FormModalBody>
    );
  }
}

AddImage.propTypes = {
  linodes: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  linode: PropTypes.object,
  disk: PropTypes.object,
};
