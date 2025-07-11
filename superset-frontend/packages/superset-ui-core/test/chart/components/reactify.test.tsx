/*
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

import '@testing-library/jest-dom';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { reactify } from '@superset-ui/core';
import { render, screen } from '@testing-library/react';
import { RenderFuncType } from '../../../src/chart/components/reactify';

describe('reactify(renderFn)', () => {
  const renderFn: RenderFuncType<{ content?: string }> = jest.fn(
    (element, props) => {
      const container = element;
      container.innerHTML = '';
      const child = document.createElement('b');
      child.innerHTML = props.content ?? '';
      container.append(child);
    },
  );

  renderFn.displayName = 'BoldText';

  renderFn.propTypes = {
    content: PropTypes.string,
  };

  renderFn.defaultProps = {
    content: 'ghi',
  };

  const willUnmountCb = jest.fn();

  const TheChart = reactify(renderFn);
  const TheChartWithWillUnmountHook = reactify(renderFn, {
    componentWillUnmount: willUnmountCb,
  });

  class TestComponent extends PureComponent<{}, { content: string }> {
    constructor(props = {}) {
      super(props);
      this.state = { content: 'abc' };
    }

    componentDidMount() {
      setTimeout(() => {
        this.setState({ content: 'def' });
      }, 10);
    }

    render() {
      const { content } = this.state;

      return <TheChart id="test" content={content} />;
    }
  }

  class AnotherTestComponent extends PureComponent<{}, {}> {
    render() {
      return <TheChartWithWillUnmountHook id="another_test" />;
    }
  }

  it('returns a React component class', () =>
    new Promise(done => {
      render(<TestComponent />);

      expect(renderFn).toHaveBeenCalledTimes(1);
      expect(screen.getByText('abc')).toBeInTheDocument();
      expect(screen.getByText('abc').parentNode).toHaveAttribute('id', 'test');
      setTimeout(() => {
        expect(renderFn).toHaveBeenCalledTimes(2);
        expect(screen.getByText('def')).toBeInTheDocument();
        expect(screen.getByText('def').parentNode).toHaveAttribute(
          'id',
          'test',
        );
        done(undefined);
      }, 20);
    }));
  describe('displayName', () => {
    it('has displayName if renderFn.displayName is defined', () => {
      expect(TheChart.displayName).toEqual('BoldText');
    });
    it('does not have displayName if renderFn.displayName is not defined', () => {
      const AnotherChart = reactify(() => {});
      expect(AnotherChart.displayName).toBeUndefined();
    });
  });
  describe('propTypes', () => {
    it('has propTypes if renderFn.propTypes is defined', () => {
      /* eslint-disable-next-line react/forbid-foreign-prop-types */
      expect(Object.keys(TheChart.propTypes ?? {})).toEqual(['content']);
    });
    it('does not have propTypes if renderFn.propTypes is not defined', () => {
      const AnotherChart = reactify(() => {});
      /* eslint-disable-next-line react/forbid-foreign-prop-types */
      expect(Object.keys(AnotherChart.propTypes ?? {})).toEqual([]);
    });
  });
  describe('defaultProps', () => {
    it('has defaultProps if renderFn.defaultProps is defined', () => {
      expect(TheChart.defaultProps).toBe(renderFn.defaultProps);
      render(<TheChart id="test" />);
      expect(screen.getByText('ghi')).toBeInTheDocument();
      expect(screen.getByText('ghi').parentNode).toHaveAttribute('id', 'test');
    });
    it('does not have defaultProps if renderFn.defaultProps is not defined', () => {
      const AnotherChart = reactify(() => {});
      expect(AnotherChart.defaultProps).toBeUndefined();
    });
  });
  it('does not try to render if not mounted', () => {
    const anotherRenderFn = jest.fn();
    const AnotherChart = reactify(anotherRenderFn); // enables valid new AnotherChart() call
    // @ts-ignore
    new AnotherChart({ id: 'test' }).execute();
    expect(anotherRenderFn).not.toHaveBeenCalled();
  });
  it('calls willUnmount hook when it is provided', () =>
    new Promise(done => {
      const { unmount } = render(<AnotherTestComponent />);
      setTimeout(() => {
        unmount();
        expect(willUnmountCb).toHaveBeenCalledTimes(1);
        done(undefined);
      }, 20);
    }));
});
