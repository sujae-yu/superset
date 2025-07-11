/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { createRef, PureComponent } from 'react';
import { styled } from '@superset-ui/core';
import {
  ModalTrigger,
  ModalTriggerRef,
} from '@superset-ui/core/components/ModalTrigger';
import FilterScope from 'src/dashboard/containers/FilterScope';

type FilterScopeModalProps = {
  triggerNode: JSX.Element;
};

const FilterScopeModalBody = styled.div(({ theme: { sizeUnit } }) => ({
  padding: sizeUnit * 2,
  paddingBottom: sizeUnit * 3,
}));

export default class FilterScopeModal extends PureComponent<
  FilterScopeModalProps,
  {}
> {
  modal: ModalTriggerRef;

  constructor(props: FilterScopeModalProps) {
    super(props);

    this.modal = createRef() as ModalTriggerRef;
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleCloseModal(): void {
    this?.modal?.current?.close?.();
  }

  render() {
    const filterScopeProps = {
      onCloseModal: this.handleCloseModal,
    };

    return (
      <ModalTrigger
        ref={this.modal}
        triggerNode={this.props.triggerNode}
        modalBody={
          <FilterScopeModalBody>
            <FilterScope {...filterScopeProps} />
          </FilterScopeModalBody>
        }
        width="80%"
      />
    );
  }
}
