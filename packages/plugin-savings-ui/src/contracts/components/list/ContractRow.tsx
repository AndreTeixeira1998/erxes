import _ from 'lodash';
import { FormControl, formatValue } from '@erxes/ui/src';
import React from 'react';
import { FlexItem } from '../../styles';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
  history: any;
  isChecked: boolean;
  toggleBulk: (contract: IContract, isChecked?: boolean) => void;
};

function displayValue(contract, name) {
  const value = _.get(contract, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(contract.primaryName)}</FlexItem>;
  }
  if (name.includes('Amount'))
    return formatValue(value ? value?.toLocaleString() : value);

  return formatValue(value);
}

function ContractRow({ contract, history, isChecked, toggleBulk }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(contract, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/erxes-plugin-saving/contract-details/${contract._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>

      <td key={'number'}>{displayValue(contract, 'number')} </td>
      <td key={'number'}>{displayValue(contract.customers, 'firstName')} </td>
      <td key={'number'}>{displayValue(contract.customers, 'code')} </td>
      <td key={'savingAmount'}>{displayValue(contract, 'savingAmount')}</td>
      <td key={'status'}>{displayValue(contract, 'status')}</td>
      <td key={'tenor'}>{displayValue(contract, 'duration')}</td>
      <td key={'interestRate'}>{displayValue(contract, 'interestRate')}</td>
    </tr>
  );
}

export default ContractRow;
