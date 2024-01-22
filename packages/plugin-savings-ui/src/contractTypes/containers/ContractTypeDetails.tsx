import { Alert, EmptyState, Spinner } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';
import { withRouter } from 'react-router-dom';
import ContractTypeDetails from '../components/ContractTypeDetails';
import { mutations, queries } from '../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IContractType,
  RemoveMutationResponse,
} from '../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps;

const ContractTypeDetailsContainer = (props: FinalProps) => {
  const { id, currentUser, history } = props;

  const contractTypeDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.contractTypeDetail),
    {
      variables: {
        _id: id,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [contractTypesEdit] = useMutation<EditMutationResponse>(
    gql(mutations.contractTypesEdit),
    {
      refetchQueries: ['savingsContractTypeDetail'],
    },
  );

  const [contractTypesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractTypesRemove),
    {
      refetchQueries: ['savingsContractTypesMain'],
    },
  );

  const saveItem = (doc: IContractType, callback: (item) => void) => {
    contractTypesEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback((data || {}).contractTypesEdit);
        }
        Alert.success('You successfully updated contract type');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const remove = () => {
    contractTypesRemove({ variables: { contractTypeIds: [id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-saving/contract-types');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (contractTypeDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!contractTypeDetailQuery?.data?.savingsContractTypeDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const contractTypeDetail =
    contractTypeDetailQuery?.data?.savingsContractTypeDetail;

  const updatedProps = {
    ...props,
    loading: contractTypeDetailQuery.loading,
    contractType: contractTypeDetail,
    currentUser,
    saveItem,
    remove,
  };

  return <ContractTypeDetails {...(updatedProps as any)} />;
};

export default withRouter<FinalProps>(ContractTypeDetailsContainer);
