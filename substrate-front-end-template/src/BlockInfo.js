import React, { useEffect, useState } from "react";
import { Table } from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib";

function Main() {
  const { api } = useSubstrate();
  const [blockInfo, setBlockInfo] = useState(0);

  useEffect(() => {
    const unsubscribeAll = null;

    const getBlockInfo = async () => {
      try {
        api.rpc.chain.subscribeNewHeads((head) => {
          setBlockInfo(head);
          console.log(head);
        });
      } catch (e) {
        console.error(e);
      }
    };

    getBlockInfo();

    return () => unsubscribeAll && unsubscribeAll();
  }, [api]);

  return blockInfo ? (
    <Table celled striped>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan="2">
            <center>
              <h3>Latest Block Info</h3>
            </center>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Block Height:</Table.Cell>
          <Table.Cell>{blockInfo.number.toString()}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Hash</Table.Cell>
          <Table.Cell>{blockInfo.hash.toString()}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Previous Block Hash</Table.Cell>
          <Table.Cell>{blockInfo.parentHash.toString()}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>State Root</Table.Cell>
          <Table.Cell>{blockInfo.stateRoot.toString()}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Extrinsics Root</Table.Cell>
          <Table.Cell>{blockInfo.extrinsicsRoot.toString()}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ) : null;
}

export default function BlockInfo(props) {
  const { api } = useSubstrate();
  return api.rpc && api.rpc.system.version ? <Main {...props} /> : null;
}
