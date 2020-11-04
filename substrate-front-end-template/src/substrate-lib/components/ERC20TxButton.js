import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { web3FromSource } from '@polkadot/extension-dapp';

import { useSubstrate } from '../';
import utils from '../utils';

import ERC20 from '../../ERC20';

function ERC20TxButton ({
  accountPair = null,
  label,
  setStatus,
  color = 'blue',
  style = null,
  type = 'QUERY',
  attrs = null,
  disabled = false
}) {
  // Hooks
  const { api } = useSubstrate();
  const handleERC20 = ERC20(api);
  const [unsub, setUnsub] = useState(null);

  const { inputParams, paramFields } = attrs;

  const isSigned = () => type === 'SIGNED-TX';

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
    let fromAcct;

    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }

    return fromAcct;
  };

  const signedTx = async () => {
    const fromAcct = await getFromAcct();
    const transformed = transformParams(paramFields, inputParams);

    // MODIFIED for ERC20
    const [addressTo, amount] = transformed;
    const gasLimit = 1000000000000; //50% of block?

    await handleERC20.tx
      .transfer(0, gasLimit, addressTo, amount)
      .signAndSend(fromAcct, (result) => {
        if (result.status.isInBlock) {
          console.log("In block")
        } else if (result.status.isFinalized) {
            if (result.asSuccess){
              setStatus(`😉 SUCCESS!!! See events for deets->!`)}
            else {
              setStatus("😞 Transfer failed! See events for deets->")
            }
        }
      })

    setUnsub(() => unsub);
  };

  const transaction = async () => {
    if (unsub) {
      unsub();
      setUnsub(null);
    }

    setStatus('Sending...');

    isSigned() && signedTx()
  };

  const transformParams = (paramFields, inputParams, opts = { emptyAsNull: true }) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map(inputParam => {
      // To cater the js quirk that `null` is a type of `object`.
      if (typeof inputParam === 'object' && inputParam !== null && typeof inputParam.value === 'string') {
        return inputParam.value.trim();
      } else if (typeof inputParam === 'string') {
        return inputParam.trim();
      }
      return inputParam;
    });
    const params = paramFields.map((field, ind) => ({ ...field, value: paramVal[ind] || null }));

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '') return (opts.emptyAsNull ? [...memo, null] : memo);

      let converted = value;

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map(e => e.trim());
        converted = converted.map(single => isNumType(type)
          ? (single.indexOf('.') >= 0 ? Number.parseFloat(single) : Number.parseInt(single))
          : single
        );
        return [...memo, converted];
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted = converted.indexOf('.') >= 0 ? Number.parseFloat(converted) : Number.parseInt(converted);
      }
      return [...memo, converted];
    }, []);
  };

  const isNumType = type =>
    utils.paramConversion.num.some(el => type.indexOf(el) >= 0);

  const allParamsFilled = () => {
    if (paramFields.length === 0) { return true; }

    return paramFields.every((paramField, ind) => {
      const param = inputParams[ind];
      if (paramField.optional) { return true; }
      if (param == null) { return false; }

      const value = typeof param === 'object' ? param.value : param;
      return value !== null && value !== '';
    });
  };

  return (
    <Button
      basic
      color={color}
      style={style}
      type='submit'
      onClick={transaction}
      disabled={ disabled || !allParamsFilled() }
    >
      {label}
    </Button>
  );
}

// prop type checking
ERC20TxButton.propTypes = {
  accountPair: PropTypes.object,
  setStatus: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['SIGNED-TX', 'UNSIGNED-TX']).isRequired,
  attrs: PropTypes.shape({
    inputParams: PropTypes.array,
    paramFields: PropTypes.array
  }).isRequired
};

export default ERC20TxButton;
