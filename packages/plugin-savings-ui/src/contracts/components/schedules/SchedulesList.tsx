import { Spinner, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { ITransaction } from '../../../transactions/types';
import ScheduleRow from './ScheduleRow';
import { ContractsTableWrapper } from '../../styles';

interface IProps {
  contractId: string;
  transactions: ITransaction[];
  loading: boolean;
  currentYear: number;
  onClickYear: (year: number) => void;
}

const SchedulesList = (props: IProps) => {
  const { transactions, loading } = props;

  if (loading) {
    return <Spinner />;
  }

  return (
    <ContractsTableWrapper>
      <Table>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Type')}</th>
            <th>{__('Saving Balance')}</th>
            <th>{__('Amount')}</th>
            <th>{__('Stored Interest')}</th>
            <th>{__('Total')}</th>
          </tr>
        </thead>
        <tbody id="schedules">
          {transactions.map((transaction) => (
            <ScheduleRow
              transaction={transaction}
              key={transaction._id}
            ></ScheduleRow>
          ))}
        </tbody>
      </Table>
    </ContractsTableWrapper>
  );
};

export default SchedulesList;
